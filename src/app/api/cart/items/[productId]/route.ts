import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function ensureCartId() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId) throw new Error("No cart");
  return cartId;
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const { qty } = await req.json();
  if (typeof qty !== "number" || qty < 1) {
    return NextResponse.json({ error: "qty must be >= 1" }, { status: 400 });
  }
  const cartId = await ensureCartId();

  await db.query(
    "UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?",
    [qty, cartId, params.productId]
  );

  const [items]: any = await db.query(
    `SELECT ci.product_id AS productId, i.name, COALESCE(ci.price_at_add,i.price) AS price, ci.qty
     FROM cart_items ci JOIN item i ON i.id=ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  return NextResponse.json({ cartId, items });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { productId: string } }
) {
  const cartId = await ensureCartId();

  await db.query(
    "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, params.productId]
  );

  const [items]: any = await db.query(
    `SELECT ci.product_id AS productId, i.name, COALESCE(ci.price_at_add,i.price) AS price, ci.qty
     FROM cart_items ci JOIN item i ON i.id=ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  return NextResponse.json({ cartId, items });
}
