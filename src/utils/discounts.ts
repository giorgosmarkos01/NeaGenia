import type { Discount, DiscountableProductRef } from "@/types/discount";

/** Active now according to active flag implied by endpoint + starts/ends window */
export function isDiscountActive(d: Discount, now = new Date()): boolean {
  const startOk = !d.startsAt || new Date(d.startsAt) <= now;
  const endOk = !d.endsAt || new Date(d.endsAt) >= now;
  return startOk && endOk;
}

/**
 * Does discount apply to this product?
 * Supports:
 *  - item-scoped discount (exact product id match)
 *  - category-scoped discount (product is the exact category, OR product descendant of that category if you provide categoryPath)
 */
export function isDiscountApplicableToProduct(
  d: Discount,
  product: DiscountableProductRef
): boolean {
  if (d.scope === "item") {
    return d.appliesTo.itemId === product.id;
  }

  // category scope
  const discCat = d.appliesTo.categoryId;
  if (!discCat) return false;

  // If you have full ancestry on the product, prefer that.
  if (Array.isArray(product.categoryPath) && product.categoryPath.length) {
    return product.categoryPath.includes(discCat);
  }

  // Else fallback to leaf equality if only categoryId is known
  if (typeof product.categoryId === "number") {
    return product.categoryId === discCat;
  }

  return false;
}

/** Compute the effect of one discount on a given price (no < 0) */
export function applySingleDiscount(price: number, d: Discount): number {
  if (d.type === "fixed") {
    return Math.max(0, price - d.value);
  } else {
    // percent
    const pct = Math.min(Math.max(d.value, 0), 100); // clamp 0..100
    return Math.max(0, price * (1 - pct / 100));
  }
}

/** If discounts are stackable, apply them sequentially; otherwise pick best single discount. */
export function applyDiscountsToPrice(
  price: number,
  discounts: Discount[]
): { final: number; applied: Discount[] } {
  if (!discounts.length) return { final: price, applied: [] };

  // If ANY non-stackable discount exists → choose the single best one
  const hasNonStackable = discounts.some((d) => !d.stackable);

  if (hasNonStackable) {
    // pick the discount that yields the lowest price
    let best = discounts[0];
    let bestPrice = applySingleDiscount(price, best);
    for (let i = 1; i < discounts.length; i++) {
      const candidate = discounts[i];
      const p2 = applySingleDiscount(price, candidate);
      if (p2 < bestPrice) {
        best = candidate;
        bestPrice = p2;
      }
    }
    return { final: bestPrice, applied: [best] };
  }

  // All stackable → apply in sequence (order fixed → percent yields better result for user)
  const fixedFirst = [
    ...discounts.filter((d) => d.type === "fixed"),
    ...discounts.filter((d) => d.type === "percent"),
  ];

  let result = price;
  for (const d of fixedFirst) {
    result = applySingleDiscount(result, d);
  }
  return { final: result, applied: fixedFirst };
}

/**
 * Filter applicable & active discounts for a product.
 * Returns the chosen set you should apply (already respects stackable logic).
 */
export function pickDiscountsForProduct(
  product: DiscountableProductRef,
  discounts: Discount[],
  now = new Date()
): { applicable: Discount[]; finalPrice: number } {
  // 1) active + applicable
  const candidates = discounts.filter(
    (d) => isDiscountActive(d, now) && isDiscountApplicableToProduct(d, product)
  );

  // 2) choose set to apply (stackable rules)
  const { final, applied } = applyDiscountsToPrice(product.price, candidates);

  return { applicable: applied, finalPrice: final };
}
