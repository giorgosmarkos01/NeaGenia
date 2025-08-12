import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { productId, qty = 1, price } = await req.json();
  if (!productId || qty < 1) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  let createdCart = false;

  if (!cartId) {
    cartId = uuidv4();
    await db.query("INSERT INTO carts (id) VALUES (?)", [cartId]);
    createdCart = true;
  }

  const [[product]]: any = await db.query(
    "SELECT price, name FROM item WHERE id = ?",
    [productId]
  );
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const priceToUse = price ?? product.price;

  await db.query(
    `INSERT INTO cart_items (cart_id, product_id, qty, price_at_add)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
    [cartId, productId, qty, priceToUse]
  );

  const [items]: any = await db.query(
    `SELECT ci.product_id AS productId, i.name AS name,
            COALESCE(ci.price_at_add, i.price) AS price, ci.qty AS qty
     FROM cart_items ci JOIN item i ON i.id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  // Βάλε cookie πάνω στο response (πιο αξιόπιστο)
  const res = NextResponse.json({ cartId, items });
  if (createdCart) {
    res.cookies.set("cartId", cartId!, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
