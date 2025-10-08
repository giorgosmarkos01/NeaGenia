import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";

// Reusable WHERE clause for the active time window
const ACTIVE_WINDOW = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

const QuerySchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parse = QuerySchema.safeParse({ itemId: searchParams.get("itemId") });
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.issues[0]?.message || "Invalid query" }, { status: 400 });
    }
    const { itemId } = parse.data;

    type DiscountRow = {
      id: number;
      name: string;
      discount_type: "fixed" | "percent";
      value: number;
      starts_at: string | null;
      ends_at: string | null;
      stackable: 0 | 1;
      coupon_code: string | null;
    } & RowDataPacket;

    const rows = await queryRows<DiscountRow>(
      `
      SELECT d.id, d.name, d.discount_type, d.value, d.starts_at, d.ends_at,
             d.stackable, d.coupon_code
      FROM discount d
      JOIN discount_item di ON di.discount_id = d.id
      WHERE ${ACTIVE_WINDOW}
        AND di.item_id = ?
      ORDER BY d.id DESC
      `,
      [itemId]
    );

    // Normalize output
    const discounts = rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.discount_type,                   // 'fixed' | 'percent'
      value: Number(r.value),
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      stackable: Boolean(r.stackable),
      couponCode: r.coupon_code,
      scope: "item" as const,
      appliesTo: { itemId },
    }));

    return NextResponse.json({ discounts });
  } catch (err: any) {
    console.error("[discounts/by-item] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
