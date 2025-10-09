// /helpers/couponApply.ts
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export type CartLineIn = {
  /** Can be a product UUID or a slug */
  identifier: string;
  qty: number;
};

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
  item_id: string; // UUID
} & RowDataPacket;

type ItemRow = {
  id: string;          // UUID
  slug: string;
  price: number;
  category_id: number;
} & RowDataPacket;

export type AppliedCouponResult = {
  ok: boolean;
  /** Provided only when ok=false */
  reason?: "invalid_coupon" | "not_applicable";
  discountId?: number;
  lines: Array<{
    itemId: string;          // UUID
    unitPrice: number;       // authoritative price from DB
    qty: number;
    originalLineTotal: number;
    finalLineTotal: number;
    discountAmount: number;
    appliedDiscountIds: number[];
  }>;
  subtotalBefore: number;
  subtotalAfter: number;
};

const ACTIVE = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

const placeholders = (n: number) => Array(n).fill("?").join(",");

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
        ? Math.max(0, unit * (1 - Number(d.value) / 100))
        : Math.max(0, unit - Number(d.value));
    }
    const total = Math.max(0, unit * qty);
    return { finalLineTotal: total, discountAmount: base - total, applied: discounts.map(d => d.id) };
  }

  // pick the single best
  let bestTotal = base;
  let bestId: number | null = null;
  for (const d of discounts) {
    const unit = d.discount_type === "percent"
      ? Math.max(0, unitPrice * (1 - Number(d.value) / 100))
      : Math.max(0, unitPrice - Number(d.value));
    const total = unit * qty;
    if (total < bestTotal) { bestTotal = total; bestId = d.id; }
  }
  return { finalLineTotal: bestTotal, discountAmount: base - bestTotal, applied: bestId ? [bestId] : [] };
}

/**
 * Resolve authoritative items (price/category) by UUID or slug.
 */
async function resolveItems(identifiers: string[]): Promise<Map<string, ItemRow>> {
  const uuids = identifiers.filter(looksLikeUuid);
  const slugs = identifiers.filter(id => !looksLikeUuid(id)).map(s => s.toLowerCase());

  let rows: ItemRow[] = [];
  if (uuids.length && slugs.length) {
    const [r]: any[] = await db.query(
      `SELECT id, slug, price, category_id
       FROM item
       WHERE id IN (${placeholders(uuids.length)})
          OR LOWER(slug) IN (${placeholders(slugs.length)})`,
      [...uuids, ...slugs]
    );
    rows = r as ItemRow[];
  } else if (uuids.length) {
    const [r]: any[] = await db.query(
      `SELECT id, slug, price, category_id
       FROM item
       WHERE id IN (${placeholders(uuids.length)})`,
      uuids
    );
    rows = r as ItemRow[];
  } else if (slugs.length) {
    const [r]: any[] = await db.query(
      `SELECT id, slug, price, category_id
       FROM item
       WHERE LOWER(slug) IN (${placeholders(slugs.length)})`,
      slugs
    );
    rows = r as ItemRow[];
  }

  // index by both uuid and slug for quick lookup
  const map = new Map<string, ItemRow>();
  for (const it of rows) {
    map.set(it.id, it);
    map.set(it.slug.toLowerCase(), it);
  }
  return map;
}

/**
 * Apply a coupon server-side to a cart snapshot.
 * - If coupon is null/empty → returns undiscounted lines (ok=true).
 * - If coupon invalid → ok=false, reason="invalid_coupon".
 * - If valid but not applicable → ok=false, reason="not_applicable" (lines still returned).
 */
export async function applyCouponServerSide(
  coupon: string | null | undefined,
  cart: CartLineIn[]
): Promise<AppliedCouponResult> {
  const identifiers = cart.map(l => String(l.identifier || "").trim()).filter(Boolean);
  if (!identifiers.length) {
    return { ok: false, reason: "not_applicable", lines: [], subtotalBefore: 0, subtotalAfter: 0 };
  }

  // 0) Load authoritative items
  const itemIndex = await resolveItems(identifiers);

  // normalize cart lines to DB-backed entries
  const normalized = cart.map(l => {
    const key = String(l.identifier || "").trim();
    const candidate = itemIndex.get(looksLikeUuid(key) ? key : key.toLowerCase());
    if (!candidate) return null;
    return {
      db: candidate,
      qty: Number(l.qty) || 0,
    };
  }).filter(Boolean) as Array<{ db: ItemRow; qty: number }>;

  if (!normalized.length) {
    return { ok: false, reason: "not_applicable", lines: [], subtotalBefore: 0, subtotalAfter: 0 };
  }

  // If no coupon: return undiscounted lines (still ok=true)
  if (!coupon) {
    const lines = normalized.map(({ db, qty }) => {
      const unit = Number(db.price) || 0;
      const base = unit * qty;
      return {
        itemId: db.id,
        unitPrice: unit,
        qty,
        originalLineTotal: base,
        finalLineTotal: base,
        discountAmount: 0,
        appliedDiscountIds: [],
      };
    });
    const subtotalBefore = lines.reduce((s, r) => s + r.originalLineTotal, 0);
    return { ok: true, lines, subtotalBefore, subtotalAfter: subtotalBefore };
  }

  const code = String(coupon).trim();
  // 1) Validate coupon exists/active
  const [foundRows]: any[] = await db.query(
    `SELECT d.id FROM discount d WHERE d.coupon_code = ? AND ${ACTIVE} LIMIT 1`,
    [code]
  );
  const found = (foundRows ?? []) as Array<{ id: number }>;
  if (!found.length) {
    // invalid coupon -> still return undiscounted lines
    const lines = normalized.map(({ db, qty }) => {
      const unit = Number(db.price) || 0;
      const base = unit * qty;
      return {
        itemId: db.id,
        unitPrice: unit,
        qty,
        originalLineTotal: base,
        finalLineTotal: base,
        discountAmount: 0,
        appliedDiscountIds: [],
      };
    });
    const subtotalBefore = lines.reduce((s, r) => s + r.originalLineTotal, 0);
    return { ok: false, reason: "invalid_coupon", lines, subtotalBefore, subtotalAfter: subtotalBefore };
  }
  const discountId = Number(found[0].id);

  // 2) Fetch discount links (by item & by category) for THIS coupon
  const ids = normalized.map(n => n.db.id);
  const ph = placeholders(ids.length);

  const [byItemRows]: any[] = await db.query(
    `SELECT d.*, di.item_id
     FROM discount d
     JOIN discount_item di ON di.discount_id = d.id
     WHERE d.id = ?
       AND di.item_id IN (${ph})`,
    [discountId, ...ids]
  );

  const [byCategoryRows]: any[] = await db.query(
    `SELECT d.*, i.id AS item_id
     FROM discount d
     JOIN discount_category dc ON dc.discount_id = d.id
     JOIN item i ON i.category_id = dc.category_id
     WHERE d.id = ?
       AND i.id IN (${ph})`,
    [discountId, ...ids]
  );

  const all = [
    ...((byItemRows ?? []) as DiscountRow[]),
    ...((byCategoryRows ?? []) as DiscountRow[]),
  ].map((r: any) => ({ ...r, value: Number(r.value) }));

  // item_id -> discounts[]
  const discountsByItem = new Map<string, DiscountRow[]>();
  for (const d of all) {
    const k = String(d.item_id);
    const arr = discountsByItem.get(k) ?? [];
    arr.push(d);
    discountsByItem.set(k, arr);
  }

  // 3) Compute discounted totals
  const lines = normalized.map(({ db, qty }) => {
    const unit = Number(db.price) || 0;
    const ds = discountsByItem.get(db.id) ?? [];
    const { finalLineTotal, discountAmount, applied } = applyBestDiscountForLine(unit, qty, ds);
    return {
      itemId: db.id,
      unitPrice: unit,
      qty,
      originalLineTotal: unit * qty,
      finalLineTotal,
      discountAmount,
      appliedDiscountIds: applied,
    };
  });

  const subtotalBefore = lines.reduce((s, r) => s + r.originalLineTotal, 0);
  const subtotalAfter  = lines.reduce((s, r) => s + r.finalLineTotal, 0);
  const appliedAny = lines.some(l => l.discountAmount > 0);

  return {
    ok: appliedAny,
    reason: appliedAny ? undefined : "not_applicable",
    discountId,
    lines,
    subtotalBefore,
    subtotalAfter,
  };
}
