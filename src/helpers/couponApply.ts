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
  price: number;       // GROSS (VAT-included) unit price
  category_id: number;
} & RowDataPacket;

export type AppliedCouponResult = {
  ok: boolean;
  /** Provided only when ok=false */
  reason?: "invalid_coupon" | "not_applicable";
  discountId?: number;
  lines: Array<{
    itemId: string;          // UUID
    unitPrice: number;       // authoritative gross unit price from DB
    qty: number;
    originalLineTotal: number; // gross
    finalLineTotal: number;    // gross after NET-discount + re-gross
    discountAmount: number;    // gross delta
    appliedDiscountIds: number[];
  }>;
  subtotalBefore: number; // gross
  subtotalAfter: number;  // gross
};

// === NEW: VAT handling ===
const VAT_RATE = 0.24; // 24% VAT
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const ACTIVE = `
  d.active = 1
  AND (d.starts_at IS NULL OR d.starts_at <= NOW())
  AND (d.ends_at   IS NULL OR d.ends_at   >= NOW())
`;

const placeholders = (n: number) => Array(n).fill("?").join(",");

const looksLikeUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/**
 * Apply discounts to the NET price (pre-VAT), then re-gross.
 * - unitPrice is GROSS (VAT-included)
 * - discounts: fixed values and percent values are assumed to be defined on NET
 *              (as per your new requirement)
 */
function applyBestDiscountForLine(
  unitPriceGross: number,
  qty: number,
  discounts: DiscountRow[]
) {
  const baseGrossLineTotal = round2(unitPriceGross * qty);
  if (!discounts.length) {
    return {
      finalLineTotal: baseGrossLineTotal,
      discountAmount: 0,
      applied: [] as number[],
    };
  }

  // Convert to NET unit
  const netUnit = unitPriceGross / (1 + VAT_RATE);

  const applyOne = (net: number, d: DiscountRow) => {
    if (d.discount_type === "percent") {
      const pct = Math.min(Math.max(Number(d.value), 0), 100);
      return Math.max(0, net * (1 - pct / 100));
    } else {
      // fixed discount on NET
      return Math.max(0, net - Number(d.value));
    }
  };

  // Stackable path — apply in sequence (fixed first, then percent)
  const allStackable = discounts.every((d) => !!d.stackable);
  if (allStackable) {
    const ordered = [
      ...discounts.filter((d) => d.discount_type === "fixed"),
      ...discounts.filter((d) => d.discount_type === "percent"),
    ];
    let netAfter = netUnit;
    for (const d of ordered) netAfter = applyOne(netAfter, d);

    const grossUnitAfter = round2(netAfter * (1 + VAT_RATE));
    const finalLineTotal = round2(grossUnitAfter * qty);
    return {
      finalLineTotal,
      discountAmount: round2(baseGrossLineTotal - finalLineTotal),
      applied: ordered.map((d) => d.id),
    };
  }

  // Non-stackable exists — pick the single best (lowest gross line total)
  let bestGross = baseGrossLineTotal;
  let bestId: number | null = null;

  for (const d of discounts) {
    const netAfter = applyOne(netUnit, d);
    const grossUnitAfter = round2(netAfter * (1 + VAT_RATE));
    const lineGross = round2(grossUnitAfter * qty);
    if (lineGross < bestGross) {
      bestGross = lineGross;
      bestId = d.id;
    }
  }

  return {
    finalLineTotal: bestGross,
    discountAmount: round2(baseGrossLineTotal - bestGross),
    applied: bestId ? [bestId] : [],
  };
}

/**
 * Resolve authoritative items (price/category) by UUID or slug.
 */
async function resolveItems(identifiers: string[]): Promise<Map<string, ItemRow>> {
  const uuids = identifiers.filter(looksLikeUuid);
  const slugs = identifiers.filter((id) => !looksLikeUuid(id)).map((s) => s.toLowerCase());

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
 * All totals are GROSS (VAT-included). Discounts are applied on NET, then re-grossed.
 */
export async function applyCouponServerSide(
  coupon: string | null | undefined,
  cart: CartLineIn[]
): Promise<AppliedCouponResult> {
  const identifiers = cart.map((l) => String(l.identifier || "").trim()).filter(Boolean);
  if (!identifiers.length) {
    return { ok: false, reason: "not_applicable", lines: [], subtotalBefore: 0, subtotalAfter: 0 };
  }

  // 0) Load authoritative items
  const itemIndex = await resolveItems(identifiers);

  // normalize cart lines to DB-backed entries
  const normalized = cart
    .map((l) => {
      const key = String(l.identifier || "").trim();
      const candidate = itemIndex.get(looksLikeUuid(key) ? key : key.toLowerCase());
      if (!candidate) return null;
      return {
        db: candidate,
        qty: Number(l.qty) || 0,
      };
    })
    .filter(Boolean) as Array<{ db: ItemRow; qty: number }>;

  if (!normalized.length) {
    return { ok: false, reason: "not_applicable", lines: [], subtotalBefore: 0, subtotalAfter: 0 };
  }

  // If no coupon: return undiscounted lines (ok=true)
  if (!coupon) {
    const lines = normalized.map(({ db, qty }) => {
      const unitGross = Number(db.price) || 0;
      const base = round2(unitGross * qty);
      return {
        itemId: db.id,
        unitPrice: unitGross,
        qty,
        originalLineTotal: base,
        finalLineTotal: base,
        discountAmount: 0,
        appliedDiscountIds: [],
      };
    });
    const subtotalBefore = round2(lines.reduce((s, r) => s + r.originalLineTotal, 0));
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
    // invalid coupon -> undiscounted lines
    const lines = normalized.map(({ db, qty }) => {
      const unitGross = Number(db.price) || 0;
      const base = round2(unitGross * qty);
      return {
        itemId: db.id,
        unitPrice: unitGross,
        qty,
        originalLineTotal: base,
        finalLineTotal: base,
        discountAmount: 0,
        appliedDiscountIds: [],
      };
    });
    const subtotalBefore = round2(lines.reduce((s, r) => s + r.originalLineTotal, 0));
    return { ok: false, reason: "invalid_coupon", lines, subtotalBefore, subtotalAfter: subtotalBefore };
  }
  const discountId = Number(found[0].id);

  // 2) Fetch discount links (by item & by category) for THIS coupon
  const ids = normalized.map((n) => n.db.id);
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

  // 3) Compute discounted totals (VAT-aware)
  const lines = normalized.map(({ db, qty }) => {
    const unitGross = Number(db.price) || 0;
    const ds = discountsByItem.get(db.id) ?? [];
    const { finalLineTotal, discountAmount, applied } = applyBestDiscountForLine(
      unitGross,
      qty,
      ds
    );
    return {
      itemId: db.id,
      unitPrice: unitGross,
      qty,
      originalLineTotal: round2(unitGross * qty),
      finalLineTotal,
      discountAmount,
      appliedDiscountIds: applied,
    };
  });

  const subtotalBefore = round2(lines.reduce((s, r) => s + r.originalLineTotal, 0));
  const subtotalAfter = round2(lines.reduce((s, r) => s + r.finalLineTotal, 0));
  const appliedAny = lines.some((l) => l.discountAmount > 0);

  return {
    ok: appliedAny,
    reason: appliedAny ? undefined : "not_applicable",
    discountId,
    lines,
    subtotalBefore,
    subtotalAfter,
  };
}
