import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";
import { getOrCreateCartBySession } from "@/lib/cartSession";
import { fetchDiscountsForProducts, applyDiscountsForItem } from "@/lib/discountPricing";

/* ------------------ Input ------------------ */
const PostSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(-999).max(999), // delta or absolute depending on `abs`
  price: z.number().nonnegative().optional(),
  abs: z.boolean().optional(),              // absolute set mode (idempotent)
});
const DeleteSchema = z.object({ productId: z.string().min(1) });

/* ------------------ Types ------------------ */
type CartDBItem = {
  productId: string;
  name: string;
  price: number;     // stored/base unit price (without discounts)
  qty: number;
  weight: number;     // grams, from item.weight
  imageUrl: string | null;
  subtotal: number;  // base qty*price from generated column
} & RowDataPacket;

type EffectiveCartItem = CartDBItem & {
  effectivePrice: number;     // discounted unit price (after rules)
  effectiveLineTotal: number; // discounted line total
  discounted: boolean;        // whether discount applied
};

/* ------------------ Helpers ------------------ */
async function recalcCartTotals(cartId: string) {
  await queryRows(
    `UPDATE carts
       SET total_price = (
         SELECT COALESCE(SUM(subtotal), 0)
         FROM cart_items
         WHERE cart_id = ?
       ),
           updated_at = NOW(),
           last_access_at = NOW()
     WHERE id = ?`,
    [cartId, cartId]
  );
}

async function listItems(cartId: string): Promise<CartDBItem[]> {
  const rows = await queryRows<CartDBItem>(
    `
    SELECT 
      ci.item_id AS productId,
      i.name,
      ci.price AS price,
      ci.qty,
      i.weight AS weight,
      (SELECT imageUrl
         FROM item_images img
        WHERE img.item_id = ci.item_id
        ORDER BY created_at ASC
        LIMIT 1) AS imageUrl,
      ci.subtotal
    FROM cart_items ci
    JOIN item i ON i.id = ci.item_id
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at DESC
    `,
    [cartId]
  );

  return rows.map(r => ({
    ...r,
    price: Number(r.price),
    weight: Number(r.weight) || 0,
    subtotal: Number(r.subtotal),
  }));
}

/** Build a discount-aware snapshot for the cart. */
async function computeCartSnapshot(cartId: string) {
  const dbItems = await listItems(cartId);
  if (dbItems.length === 0) {
    return { items: [] as EffectiveCartItem[], totals: { cartTotalFinal: 0 } };
  }

  // Get categories for those items (so we can apply category discounts)
  const placeholders = dbItems.map(() => "?").join(",");
  const cats = await queryRows<{ item_id: string; category_id: number | null } & RowDataPacket>(
    `SELECT id AS item_id, category_id FROM item WHERE id IN (${placeholders})`,
    dbItems.map(i => i.productId)
  );
  const categoryByItem = new Map(cats.map(c => [c.item_id, c.category_id ?? null]));

  // Fetch discounts relevant to these items/categories
  const discounts = await fetchDiscountsForProducts(dbItems.map(i => i.productId));

  // Compute effective lines
  const effectiveItems: EffectiveCartItem[] = dbItems.map(it => {
    const categoryId = categoryByItem.get(it.productId) ?? null;
    const effectivePrice = applyDiscountsForItem(it.price, it.productId, categoryId, discounts);
    const effectiveLineTotal = Number((effectivePrice * it.qty).toFixed(2));
    return {
      ...it,
      effectivePrice,
      effectiveLineTotal,
      discounted: effectivePrice < it.price,
    };
  });

  const cartTotalFinal = Number(
    effectiveItems.reduce((sum, i) => sum + i.effectiveLineTotal, 0).toFixed(2)
  );

  return { items: effectiveItems, totals: { cartTotalFinal } };
}

/* ------------------ GET ------------------ */
export async function GET() {
  const { cartId } = await getOrCreateCartBySession(null);
  const snapshot = await computeCartSnapshot(cartId);
  return NextResponse.json(snapshot);
}

/* ------------------ POST (delta or absolute) ------------------ */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = PostSchema.safeParse({ ...body, qty: Number(body?.qty) });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId, qty, price, abs } = parsed.data;
  const { cartId } = await getOrCreateCartBySession(null);

  // Verify product; get current price if none provided
  const [prod] = await queryRows<{ id: string; price: string } & RowDataPacket>(
    `SELECT id, price FROM item WHERE id = ? LIMIT 1`,
    [productId]
  );
  if (!prod) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const unitPrice = Number(price ?? prod.price);

  // Read existing line
  const [existing] = await queryRows<{ qty: number } & RowDataPacket>(
    `SELECT qty FROM cart_items WHERE cart_id = ? AND item_id = ?`,
    [cartId, productId]
  );

  if (abs) {
    const nextQty = Math.max(0, qty); // clamp to non-negative
    if (nextQty === 0) {
      await queryRows(`DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?`, [cartId, productId]);
    } else if (existing) {
      await queryRows(
        `UPDATE cart_items
           SET qty = ?, price = ?, updated_at = NOW()
         WHERE cart_id = ? AND item_id = ?`,
        [nextQty, unitPrice, cartId, productId]
      );
    } else {
      await queryRows(
        `INSERT INTO cart_items (cart_id, item_id, qty, price)
         VALUES (?, ?, ?, ?)`,
        [cartId, productId, nextQty, unitPrice]
      );
    }
  } else {
    // Delta add/remove
    if (existing) {
      const nextQty = existing.qty + qty;
      if (nextQty <= 0) {
        await queryRows(`DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?`, [cartId, productId]);
      } else {
        await queryRows(
          `UPDATE cart_items
             SET qty = ?, price = ?, updated_at = NOW()
           WHERE cart_id = ? AND item_id = ?`,
          [nextQty, unitPrice, cartId, productId]
        );
      }
    } else if (qty > 0) {
      await queryRows(
        `INSERT INTO cart_items (cart_id, item_id, qty, price)
         VALUES (?, ?, ?, ?)`,
        [cartId, productId, qty, unitPrice]
      );
    }
  }

  await recalcCartTotals(cartId);

  // Return discount-aware snapshot
  const snapshot = await computeCartSnapshot(cartId);
  return NextResponse.json(snapshot);
}

/* ------------------ DELETE ------------------ */
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId } = parsed.data;
  const { cartId } = await getOrCreateCartBySession(null);

  await queryRows(`DELETE FROM cart_items WHERE cart_id = ? AND item_id = ?`, [cartId, productId]);
  await recalcCartTotals(cartId);

  // Return discount-aware snapshot
  const snapshot = await computeCartSnapshot(cartId);
  return NextResponse.json(snapshot);
}
