import { db } from "@/lib/db";
import type { DiscountFields } from "@/lib/productSchema";

/**
 * Creates/updates/soft-disables the single auto-applied (coupon_code IS NULL)
 * item-scoped discount for a product, based on the admin form's "on sale" state.
 * Must be called within an existing transaction (uses `db.query` directly).
 */
export async function upsertProductDiscount(
  itemId: string,
  productName: string,
  input: DiscountFields
): Promise<void> {
  const [[existing]]: any = await db.query(
    `
    SELECT d.id
    FROM discount d
    JOIN discount_item di ON di.discount_id = d.id
    WHERE di.item_id = ? AND d.coupon_code IS NULL
    LIMIT 1
    `,
    [itemId]
  );

  if (!input.onSale) {
    if (existing) {
      await db.query(`UPDATE discount SET active = 0 WHERE id = ?`, [existing.id]);
    }
    return;
  }

  if (existing) {
    await db.query(
      `UPDATE discount
         SET name = ?, discount_type = ?, value = ?, starts_at = ?, ends_at = ?, active = 1
       WHERE id = ?`,
      [
        `${productName} sale`,
        input.discountType,
        input.discountValue,
        input.discountStartsAt,
        input.discountEndsAt,
        existing.id,
      ]
    );
  } else {
    const [result]: any = await db.query(
      `INSERT INTO discount (name, discount_type, value, starts_at, ends_at, active, stackable, coupon_code)
       VALUES (?, ?, ?, ?, ?, 1, 0, NULL)`,
      [
        `${productName} sale`,
        input.discountType,
        input.discountValue,
        input.discountStartsAt,
        input.discountEndsAt,
      ]
    );
    await db.query(`INSERT INTO discount_item (discount_id, item_id) VALUES (?, ?)`, [
      result.insertId,
      itemId,
    ]);
  }
}
