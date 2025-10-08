import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";

export type DiscountSummary = {
  id: number;
  name: string;
  type: "fixed" | "percent";
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  stackable: boolean;
  couponCode: string | null;
  appliesToCategoryId: number;
};

const ACTIVE = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

export async function getDiscountsByCategorySlug(slug: string): Promise<DiscountSummary[]> {
  const cat = await queryRows<{ id: number } & RowDataPacket>(
    `SELECT id FROM category WHERE slug = ? LIMIT 1`, [slug]
  );
  if (!cat.length) return [];
  const rootId = cat[0].id;

  type Row = {
    id: number; name: string; discount_type: "fixed"|"percent";
    value: string|number; starts_at: string|null; ends_at: string|null;
    stackable: 0|1; coupon_code: string|null; applies_to_category_id: number;
  } & RowDataPacket;

  const rows = await queryRows<Row>(
    `
    WITH RECURSIVE cat_tree AS (
      SELECT id FROM category WHERE id = ?
      UNION ALL
      SELECT c.id FROM category c JOIN cat_tree ct ON c.parent_id = ct.id
    )
    SELECT d.id, d.name, d.discount_type, d.value, d.starts_at, d.ends_at,
           d.stackable, d.coupon_code,
           dc.category_id AS applies_to_category_id
    FROM discount d
    JOIN discount_category dc ON dc.discount_id = d.id
    JOIN cat_tree t ON t.id = dc.category_id
    WHERE ${ACTIVE}
    ORDER BY d.id DESC
    `, [rootId]
  );

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    type: r.discount_type,
    value: Number(r.value),
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    stackable: Boolean(r.stackable),
    couponCode: r.coupon_code,
    appliesToCategoryId: r.applies_to_category_id,
  }));
}
