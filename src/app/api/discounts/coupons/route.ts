export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { queryRows } from "@/lib/db";

type CartLine = { itemId: string; unitPrice: number; qty: number };

type DiscountRow = {
  id: number;
  name: string;
  discount_type: "fixed" | "percent";
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  active: 0 | 1;
  stackable: 0 | 1;
  coupon_code: string | null;
  item_id: string; // resolved UUID
} & RowDataPacket;

const ACTIVE = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

const placeholders = (n: number) => (n > 0 ? Array(n).fill("?").join(",") : "");
const looksLikeUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

function applyBestDiscountForLine(unitPrice: number, qty: number, discounts: DiscountRow[]) {
  const base = unitPrice * qty;
  if (!discounts.length) return { finalLineTotal: base, discountAmount: 0, applied: [] as number[] };

  const allStackable = discounts.every(d => !!d.stackable);
  if (allStackable) {
    let unit = unitPrice;
    for (const d of discounts) {
      unit = d.discount_type === "percent"
        ? Math.max(0, unit * (1 - d.value / 100))
        : Math.max(0, unit - d.value);
    }
    const total = Math.max(0, unit * qty);
    return { finalLineTotal: total, discountAmount: base - total, applied: discounts.map(d => d.id) };
  }

  let bestTotal = base;
  let bestId: number | null = null;
  for (const d of discounts) {
    const unit = d.discount_type === "percent"
      ? Math.max(0, unitPrice * (1 - d.value / 100))
      : Math.max(0, unitPrice - d.value);
    const total = unit * qty;
    if (total < bestTotal) { bestTotal = total; bestId = d.id; }
  }
  return { finalLineTotal: bestTotal, discountAmount: base - bestTotal, applied: bestId ? [bestId] : [] };
}

export async function POST(req: Request) {
  try {
    const { coupon, items } = await req.json() as { coupon: string; items: CartLine[] };

    // Debug payload (server logs)
    console.log("[coupons] payload:", {
      coupon,
      items: items?.map(it => ({ itemId: it.itemId, unitPrice: it.unitPrice, qty: it.qty })),
    });

    const code = (coupon ?? "").trim();
    if (!code) return NextResponse.json({ ok: false, error: "Missing coupon." }, { status: 400 });
    if (!items?.length) return NextResponse.json({ ok: false, error: "Empty cart." }, { status: 400 });

    // 1) Validate coupon
    const found = await queryRows<{ id: number } & RowDataPacket>(
      `SELECT d.id FROM discount d WHERE d.coupon_code = ? AND ${ACTIVE} LIMIT 1`,
      [code]
    );
    if (!found.length) {
      console.log("[coupons] invalid/expired coupon:", code);
      return NextResponse.json({ ok: false, error: "Invalid or expired coupon." }, { status: 200 });
    }
    const discountId = found[0].id;

    // 2) Resolve identifiers: UUIDs OR slugs
    const identifiers = items.map(l => String(l.itemId || "").trim()).filter(Boolean);
    const uuids = identifiers.filter(looksLikeUuid);
    const slugs = identifiers.filter(v => !looksLikeUuid(v)).map(s => s.toLowerCase());

    type ItemRow = { id: string; slug: string } & RowDataPacket;
    let rows: ItemRow[] = [];

    if (uuids.length && slugs.length) {
      rows = await queryRows<ItemRow>(
        `
        SELECT id, slug
        FROM item
        WHERE id IN (${placeholders(uuids.length)})
           OR LOWER(slug) IN (${placeholders(slugs.length)})
        `,
        [...uuids, ...slugs]
      );
    } else if (uuids.length) {
      rows = await queryRows<ItemRow>(
        `SELECT id, slug FROM item WHERE id IN (${placeholders(uuids.length)})`,
        uuids
      );
    } else if (slugs.length) {
      rows = await queryRows<ItemRow>(
        `SELECT id, slug FROM item WHERE LOWER(slug) IN (${placeholders(slugs.length)})`,
        slugs
      );
    }

    const idByUuid = new Map(rows.map(r => [r.id, r.id]));
    const idBySlug = new Map(rows.map(r => [r.slug.toLowerCase(), r.id]));

    const lineDbIds = items.map(l => {
      const key = String(l.itemId || "").trim();
      return looksLikeUuid(key) ? (idByUuid.get(key) ?? null)
                                : (idBySlug.get(key.toLowerCase()) ?? null);
    });

    const resolvedIds = lineDbIds.filter((v): v is string => !!v);
    const unresolved = identifiers.filter((key, i) => !lineDbIds[i]);

    if (!resolvedIds.length) {
      return NextResponse.json({
        ok: false,
        error: "No cart items matched your database items.",
        debug: { identifiers, unresolved },
      }, { status: 200 });
    }

    // 3) Fetch discount links for THIS discount & resolved items
    const inItems = placeholders(resolvedIds.length);

    const byItem = await queryRows<DiscountRow>(
      `
      SELECT d.*, di.item_id
      FROM discount d
      JOIN discount_item di ON di.discount_id = d.id
      WHERE d.id = ?
        AND di.item_id IN (${inItems})
      `,
      [discountId, ...resolvedIds]
    );

    const byCategory = await queryRows<DiscountRow>(
      `
      SELECT d.*, i.id AS item_id
      FROM discount d
      JOIN discount_category dc ON dc.discount_id = d.id
      JOIN item i ON i.category_id = dc.category_id
      WHERE d.id = ?
        AND i.id IN (${inItems})
      `,
      [discountId, ...resolvedIds]
    );

    const all = [...byItem, ...byCategory].map(r => ({ ...r, value: Number(r.value) }));

    // item_id -> discounts[]
    const map = new Map<string, DiscountRow[]>();
    for (const d of all) {
      const arr = map.get(d.item_id) ?? [];
      arr.push(d);
      map.set(d.item_id, arr);
    }

    // 4) Compute per-line totals using the resolved UUID for each line
    const results = items.map((l, idx) => {
      const dbId = lineDbIds[idx]; // may be null
      const unit = Number(l.unitPrice) || 0;
      const qty  = Number(l.qty) || 0;
      const discounts = dbId ? (map.get(dbId) ?? []) : [];
      const { finalLineTotal, discountAmount, applied } =
        applyBestDiscountForLine(unit, qty, discounts);
      return {
        itemId: dbId ?? String(l.itemId),
        originalLineTotal: unit * qty,
        finalLineTotal,
        discountAmount,
        appliedDiscountIds: applied,
        resolved: !!dbId,
      };
    });

    const appliedAny = results.some(r => r.discountAmount > 0);
    const subtotalBefore = results.reduce((s, r) => s + r.originalLineTotal, 0);
    const subtotalAfter  = results.reduce((s, r) => s + r.finalLineTotal, 0);

    if (!appliedAny) {
      return NextResponse.json({
        ok: false,
        error: "Coupon is valid but does not apply to any items in your cart.",
        results, subtotalBefore, subtotalAfter
      }, { status: 200 });
    }

    return NextResponse.json({ ok: true, results, subtotalBefore, subtotalAfter }, { status: 200 });
  } catch (e) {
    console.error("[api/discounts/coupons] error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
