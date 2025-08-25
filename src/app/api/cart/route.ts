import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

function mapRows(rows: any[]) {
  return rows.map((r) => ({
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

async function resolveCartId() {
  const { userId } = await auth(); // <<-- await here
  const cookieStore = await cookies();

  if (userId) {
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
    return { cartId: userCartId, clearGuest };
  }

  // guest
  let cartId = cookieStore.get("cartId")?.value;
  let setGuest = false;
  if (!cartId) {
    cartId = uuidv4();
    await db.query(`INSERT INTO carts (id, status) VALUES (?, 'open')`, [
      cartId,
    ]);
    setGuest = true;
  }
  return { cartId, setGuest };
}

export async function GET() {
  const { userId } = await auth(); // <<-- and here
  const r = await resolveCartId();
  const items = await fetchCartItems(r.cartId);

  const res = NextResponse.json({ cartId: r.cartId, items });

  if (!userId && (r as any).setGuest) {
    res.cookies.set("cartId", r.cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  if (userId && (r as any).clearGuest) {
    res.cookies.set("cartId", "", { path: "/", maxAge: 0 });
  }
  return res;
}
