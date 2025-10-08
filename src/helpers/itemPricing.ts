import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

type ShippingCode = "ELTA" | "FEDEX" | "BOXNOW";

type Line = {
  cartItemId: number;
  productId: string;
  name: string;
  qty: number;
  basePrice: number; // from item.price (authoritative)
  variations: Array<{ id: number; name: string; price: number }>;
  unitPrice: number;   // base + sum(variation_price)
  lineTotal: number;   // unitPrice * qty
};

export async function computeOrderTotals(cartId: string, shipping: ShippingCode) {
  // 1) Load cart lines with authoritative base price from `item`
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        ci.id   AS cartItemId,
        ci.qty  AS qty,
        i.id    AS productId,
        i.name  AS name,
        i.price AS basePrice
      FROM cart_items ci
      JOIN item i ON i.id = ci.item_id   -- FIXED: was ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC
    `,
    [cartId]
  );

  const lines: Line[] = rows.map((r) => ({
    cartItemId: Number(r.cartItemId),
    productId: String(r.productId),
    name: String(r.name),
    qty: Number(r.qty),
    basePrice: Number(r.basePrice),
    variations: [],
    unitPrice: 0,
    lineTotal: 0,
  }));

  if (lines.length === 0) {
    return { lines: [], subtotal: 0, shippingCost: 0, total: 0 };
  }

  // 2) Load selected variations per cart line (if any)
  const cartItemIds = lines.map((l) => l.cartItemId);
  if (cartItemIds.length > 0) {
    const placeholders = cartItemIds.map(() => "?").join(",");
    const [vrows] = await db.query<RowDataPacket[]>(
      `
        SELECT
          civ.cart_item_id  AS cartItemId,
          v.id              AS variationId,
          v.name            AS variationName,
          v.variation_price AS variationPrice
        FROM cart_item_variations civ
        JOIN item_variation v ON v.id = civ.variation_id
        WHERE civ.cart_item_id IN (${placeholders})
      `,
      cartItemIds
    );

    const grouped = new Map<number, Array<{ id: number; name: string; price: number }>>();
    vrows.forEach((r) => {
      const key = Number(r.cartItemId);
      const list = grouped.get(key) || [];
      list.push({
        id: Number(r.variationId),
        name: String(r.variationName),
        price: Number(r.variationPrice),
      });
      grouped.set(key, list);
    });

    for (const line of lines) {
      line.variations = grouped.get(line.cartItemId) || [];
    }
  }

  // 3) Compute authoritative prices
  for (const line of lines) {
    const variationsSum = line.variations.reduce((s, v) => s + (Number(v.price) || 0), 0);
    line.unitPrice = Number((line.basePrice + variationsSum).toFixed(2));
    line.lineTotal = Number((line.unitPrice * line.qty).toFixed(2));
  }

  const subtotal = Number(lines.reduce((s, l) => s + l.lineTotal, 0).toFixed(2));
  const shippingCost = shipping === "ELTA" ? 4.35 : 0; // tweak to your rules
  const total = Number((subtotal + shippingCost).toFixed(2));

  return { lines, subtotal, shippingCost, total };
}
