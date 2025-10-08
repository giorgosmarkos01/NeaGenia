import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";
import { getOrCreateCartBySession } from "@/lib/cartSession";

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
  imageUrl: string | null;
  subtotal: number;  // base qty*price from generated column
} & RowDataPacket;

type DiscountRow = {
  id: number;
  name: string;
  discount_type: "fixed" | "percent";
  value: number; // euros or percent
  stackable: 0 | 1;
  starts_at: string | null;
  ends_at: string | null;
  scope: "item" | "category";
  item_id?: string | null;
  category_id?: number | null;
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
    subtotal: Number(r.subtotal),
  }));
}

/** Fetch active discounts for the given productIds (both item- and category-scoped). */
async function fetchDiscountsForProducts(productIds: string[]): Promise<DiscountRow[]> {
  if (productIds.length === 0) return [];

  // We fetch:
  // 1) item-scoped discounts that directly target these item ids
  // 2) category-scoped discounts for the categories of these items
  const placeholders = productIds.map(() => "?").join(",");
  const rows = await queryRows<DiscountRow>(
    `
    WITH item_categories AS (
      SELECT it.id AS item_id, it.category_id
      FROM item it
      WHERE it.id IN (${placeholders})
    )
    -- Item-scoped
    SELECT 
      d.id, d.name, d.discount_type, d.value, d.stackable, d.starts_at, d.ends_at,
      'item' AS scope, di.item_id, NULL AS category_id
    FROM discount d
    JOIN discount_item di ON di.discount_id = d.id
    WHERE d.active = 1
      AND (d.starts_at IS NULL OR d.starts_at <= NOW())
      AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
      AND di.item_id IN (${placeholders})

    UNION ALL

    -- Category-scoped (match categories of those items)
    SELECT 
      d.id, d.name, d.discount_type, d.value, d.stackable, d.starts_at, d.ends_at,
      'category' AS scope, NULL AS item_id, dc.category_id
    FROM discount d
    JOIN discount_category dc ON dc.discount_id = d.id
    JOIN item_categories ic ON ic.category_id = dc.category_id
    WHERE d.active = 1
      AND (d.starts_at IS NULL OR d.starts_at <= NOW())
      AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
    `,
    [...productIds, ...productIds]
  );

  return rows.map(r => ({
    ...r,
    discount_type: r.discount_type as any,
    value: Number(r.value),
    scope: r.scope as any,
  }));
}

/** For a single item, pick/apply discounts under stacking rules and return effective unit price. */
function applyDiscountsForItem(
  basePrice: number,
  itemId: string,
  itemCategoryId: number | null | undefined,
  discounts: DiscountRow[]
): number {
  const applicable = discounts.filter(d => {
    if (d.scope === "item") return d.item_id === itemId;
    if (d.scope === "category") return d.category_id && d.category_id === itemCategoryId;
    return false;
  });

  if (applicable.length === 0) return basePrice;

  const fixedStack: DiscountRow[] = [];
  const percentStack: DiscountRow[] = [];
  let bestFixed: DiscountRow | null = null;
  let bestPercent: DiscountRow | null = null;

  for (const d of applicable) {
    if (d.discount_type === "fixed") {
      if (d.stackable) fixedStack.push(d);
      else if (!bestFixed || d.value > bestFixed.value) bestFixed = d;
    } else {
      // percent
      if (d.stackable) percentStack.push(d);
      else if (!bestPercent || d.value > bestPercent.value) bestPercent = d;
    }
  }

  const fixedAmt =
    fixedStack.reduce((sum, d) => sum + d.value, 0) + (bestFixed ? bestFixed.value : 0);

  const percentAmt =
    percentStack.reduce((sum, d) => sum + d.value, 0) + (bestPercent ? bestPercent.value : 0);

  let final = basePrice;
  if (fixedAmt > 0) final = Math.max(0, final - fixedAmt);
  if (percentAmt > 0) final = final * Math.max(0, 1 - percentAmt / 100);

  return Number(final.toFixed(2));
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
