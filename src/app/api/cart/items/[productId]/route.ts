import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function mapItems(rows: any[]) {
  return rows.map((r) => ({
    productId: r.productId,
    name: r.name,
    price: Number(r.price),
    qty: Number(r.qty),
  }));
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });

  const { qty } = await req.json();
  const newQty = Number(qty);
  if (!Number.isFinite(newQty) || newQty < 1) {
    return NextResponse.json({ error: "Invalid qty" }, { status: 400 });
  }

  await db.query(
    `UPDATE cart_items SET qty = ? WHERE cart_id = ? AND product_id = ?`,
    [newQty, cartId, params.productId]
  );

  const [rows]: any = await db.query(
    `SELECT ci.product_id AS productId, i.name,
            COALESCE(ci.price_at_add, i.price) AS price, ci.qty
     FROM cart_items ci JOIN item i ON i.id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  return NextResponse.json({ items: mapItems(rows) });
}
