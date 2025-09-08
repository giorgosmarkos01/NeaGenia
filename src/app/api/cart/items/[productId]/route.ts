import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

// ---- shared helpers (same mapping as elsewhere)
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

async function resolveCartId() {
  const { userId } = await auth();
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
    return { cartId: userCartId };
  }

  let cartId = cookieStore.get("cartId")?.value;
  if (!cartId) {
    cartId = uuidv4();
    await db.query(`INSERT INTO carts (id, status) VALUES (?, 'open')`, [
      cartId,
    ]);
  }
  return { cartId };
}

// ---- PATCH qty --------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;
  const { qty } = await req.json();

  const newQty = Number(qty);
  if (!productId || !Number.isFinite(newQty) || newQty < 1) {
    return NextResponse.json({ error: "Invalid qty" }, { status: 400 });
  }

  const { cartId } = await resolveCartId();

  await db.query(
    `UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?`,
    [newQty, cartId, productId]
  );

  const items = await fetchCartItems(cartId);
  return NextResponse.json({ cartId, items });
}
