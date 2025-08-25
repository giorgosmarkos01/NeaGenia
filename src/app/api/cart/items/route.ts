import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

// ---- helpers ----------------------------------------------------
function mapRows(rows: any[]) {
  return rows.map((r: any) => ({
    productId: r.productId,
    slug: r.slug,
    name: r.name,
    price: Number(r.price),
    qty: Number(r.qty),
    imageUrl: r.imageUrl || null,
  }));
}

async function fetchCartItems(cartId: string) {
  const [rows]: any = await db.query(
    `
      SELECT
        ci.product_id AS productId,
        i.slug AS slug,
        i.name AS name,
        COALESCE(ci.price_at_add, i.price) AS price,
        ci.qty AS qty,
        (
          SELECT ii.imageUrl
          FROM item_images ii
          WHERE ii.item_id = i.id
          ORDER BY ii.created_at ASC
          LIMIT 1
        ) AS imageUrl
      FROM cart_items ci
      JOIN item i ON i.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC
    `,
    [cartId]
  );
  return mapRows(rows);
}

/** Βρίσκει/φτιάχνει cartId για logged-in ή guest (με merge guest→user) */
async function resolveCartId() {
  const { userId } = await auth();
  const cookieStore = await cookies();

  if (userId) {
    // user cart
    const [[existing]]: any = await db.query(
      `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    let userCartId: string = existing?.id;
    if (!userCartId) {
      userCartId = uuidv4();
      await db.query(
        `INSERT INTO carts (id, user_id, status) VALUES (?, ?, 'open')`,
        [userCartId, userId]
      );
    }

    // merge guest cart (cookie) αν υπάρχει
    const guestCartId = cookieStore.get("cartId")?.value;
    let clearGuest = false;
    if (guestCartId && guestCartId !== userCartId) {
      await db.query(
        `
    INSERT INTO cart_items (cart_id, product_id, qty, price_at_add)
    SELECT ?, src.product_id, src.qty, src.price_at_add
    FROM (
      SELECT product_id, qty, price_at_add
      FROM cart_items
      WHERE cart_id = ?
    ) AS src
    ON DUPLICATE KEY UPDATE
      qty = cart_items.qty + VALUES(qty)
  `,
        [userCartId, guestCartId]
      );
      await db.query(`DELETE FROM carts WHERE id = ?`, [guestCartId]);
      clearGuest = true;
    }

    return { cartId: userCartId, clearGuest, setGuest: false };
  }

  // guest cart
  let cartId = cookieStore.get("cartId")?.value;
  let setGuest = false;
  if (!cartId) {
    cartId = uuidv4();
    await db.query(`INSERT INTO carts (id, status) VALUES (?, 'open')`, [
      cartId,
    ]);
    setGuest = true;
  }
  return { cartId, setGuest, clearGuest: false };
}

// ---- handlers ---------------------------------------------------

// GET /api/cart/items
export async function GET() {
  const { userId } = await auth();
  const r = await resolveCartId();
  const items = await fetchCartItems(r.cartId);

  const res = NextResponse.json({ cartId: r.cartId, items });

  if (!userId && r.setGuest) {
    res.cookies.set("cartId", r.cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  if (userId && r.clearGuest) {
    res.cookies.set("cartId", "", { path: "/", maxAge: 0 });
  }
  return res;
}

// POST /api/cart/items
export async function POST(req: Request) {
  const body = await req.json();
  const deltaRaw = body?.qty;
  const productId = body?.productId;
  const price = body?.price;

  // qty εδώ σημαίνει DELTA (+1/-1). Μηδέν δεν έχει νόημα
  const delta = Number(deltaRaw);
  if (!productId || !Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { userId } = await auth();
  const r = await resolveCartId();
  const cartId = r.cartId;

  // Αν πάμε να αυξήσουμε, σιγουρεύουμε την τιμή από DB (όπως πριν)
  let priceToUse: number | null = null;
  if (delta > 0) {
    const [[product]]: any = await db.query(
      `SELECT price FROM item WHERE id = ?`,
      [productId]
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    priceToUse = price ?? product.price;
  }

  if (delta > 0) {
    // Προσθήκη/αύξηση
    await db.query(
      `
        INSERT INTO cart_items (cart_id, product_id, qty, price_at_add)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)
      `,
      [cartId, productId, delta, priceToUse]
    );
  } else {
    // Μείωση: κατεβάζουμε qty και αν πάει <= 0, διαγράφουμε τη γραμμή
    await db.query(
      `UPDATE cart_items SET qty = qty + ? WHERE cart_id = ? AND product_id = ?`,
      [delta, cartId, productId]
    );
    await db.query(
      `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND qty <= 0`,
      [cartId, productId]
    );
  }

  const items = await fetchCartItems(cartId);
  const res = NextResponse.json({ cartId, items });

  // cookies housekeeping
  if (!userId && r.setGuest) {
    res.cookies.set("cartId", cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  if (userId && r.clearGuest) {
    res.cookies.set("cartId", "", { path: "/", maxAge: 0 });
  }

  return res;
}

// DELETE /api/cart/items
export async function DELETE(req: Request) {
  // Προσπάθησε να διαβάσεις JSON, αλλιώς query param
  let productId: string | null = null;
  try {
    const body = await req.json();
    productId = body?.productId ?? null;
  } catch {
    // ignore
  }
  if (!productId) {
    const url = new URL(req.url);
    productId = url.searchParams.get("productId");
  }
  if (!productId) {
    // κάν’ το graceful: απλά γύρνα την τρέχουσα κατάσταση αντί για 400
    const r = await resolveCartId();
    const items = await fetchCartItems(r.cartId);
    return NextResponse.json({ cartId: r.cartId, items });
  }

  const r = await resolveCartId();
  const cartId = r.cartId;

  // idempotent delete
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
    [cartId, productId]
  );

  const items = await fetchCartItems(cartId);
  const res = NextResponse.json({ cartId, items });

  // καθάρισε guest cookie αν έγινε merge
  if (r.clearGuest) {
    res.cookies.set("cartId", "", { path: "/", maxAge: 0 });
  }
  return res;
}
