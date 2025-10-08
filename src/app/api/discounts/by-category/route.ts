import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";

const ACTIVE_WINDOW = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

const QuerySchema = z.object({
  categoryId: z.coerce.number().int().positive("categoryId must be a positive integer"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parse = QuerySchema.safeParse({
      categoryId: searchParams.get("categoryId"),
    });
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.issues[0]?.message || "Invalid query" }, { status: 400 });
    }
    const { categoryId } = parse.data;

    type DiscountRow = {
      id: number;
      name: string;
      discount_type: "fixed" | "percent";
      value: number;
      starts_at: string | null;
      ends_at: string | null;
      stackable: 0 | 1;
      coupon_code: string | null;
      // Optional: which matched category in the subtree
      matched_category_id: number;
    } & RowDataPacket;

    // Assumes category table has: id (INT PK), parent_id (INT NULL)
    const rows = await queryRows<DiscountRow>(
      `
      WITH RECURSIVE cat_tree AS (
        SELECT id
        FROM category
        WHERE id = ?

        UNION ALL

        SELECT c.id
        FROM category c
        JOIN cat_tree ct ON c.parent_id = ct.id
      )
      SELECT d.id, d.name, d.discount_type, d.value, d.starts_at, d.ends_at,
             d.stackable, d.coupon_code,
             dc.category_id AS matched_category_id
      FROM discount d
      JOIN discount_category dc ON dc.discount_id = d.id
      JOIN cat_tree t ON t.id = dc.category_id
      WHERE ${ACTIVE_WINDOW}
      ORDER BY d.id DESC
      `,
      [categoryId]
    );

    const discounts = rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.discount_type,                   // 'fixed' | 'percent'
      value: Number(r.value),
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      stackable: Boolean(r.stackable),
      couponCode: r.coupon_code,
      scope: "category" as const,
      appliesTo: { categoryId: r.matched_category_id }, // specific category in the subtree that matched
    }));

    return NextResponse.json({ discounts });
  } catch (err: any) {
    console.error("[discounts/by-category] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
