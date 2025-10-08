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

/**
 * We treat category.name as the slug (your names are already like 'robot-kits').
 * No hierarchy — exact match on category.name.
 */
export async function getDiscountsByCategorySlug(slug: string): Promise<DiscountSummary[]> {
  const key = (slug ?? "").trim().toLowerCase();

  // If you have virtual categories like "all-items"/"popular", handle them here or upstream.
  if (!key || key === "all-items" || key === "popular") {
    // Return [] or route to a different function if you want global/virtual discounts:
    // return getGlobalActiveDiscounts();
    return [];
  }

  type Row = {
    id: number;
    name: string;
    discount_type: "fixed" | "percent";
    value: string | number;
    starts_at: string | null;
    ends_at: string | null;
    stackable: 0 | 1;
    coupon_code: string | null;
    applies_to_category_id: number;
  } & RowDataPacket;

  // MySQL utf8mb4_unicode_ci is case-insensitive, so c.name = ? is fine.
  // If you later change collations, you can do LOWER(c.name) = ? and pass the lowercase key.
  const rows = await queryRows<Row>(
    `
    SELECT
      d.id, d.name, d.discount_type, d.value, d.starts_at, d.ends_at,
      d.stackable, d.coupon_code,
      dc.category_id AS applies_to_category_id
    FROM discount d
    JOIN discount_category dc ON dc.discount_id = d.id
    JOIN category c          ON c.id           = dc.category_id
    WHERE c.name = ?
      AND ${ACTIVE}
    ORDER BY d.id DESC
    `,
    [key]
  );

  return rows.map((r) => ({
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
