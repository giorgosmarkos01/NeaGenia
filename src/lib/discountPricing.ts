import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";

export type DiscountRow = {
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

/** Fetch active discounts (item- and category-scoped) relevant to the given item ids. */
export async function fetchDiscountsForProducts(
  productIds: string[]
): Promise<DiscountRow[]> {
  if (productIds.length === 0) return [];

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

  return rows.map((r) => ({
    ...r,
    discount_type: r.discount_type as any,
    value: Number(r.value),
    scope: r.scope as any,
  }));
}

/** For a single item, pick/apply discounts under stacking rules and return effective unit price. */
export function applyDiscountsForItem(
  basePrice: number,
  itemId: string,
  itemCategoryId: number | null | undefined,
  discounts: DiscountRow[]
): number {
  const applicable = discounts.filter((d) => {
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
