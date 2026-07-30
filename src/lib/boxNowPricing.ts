/**
 * PLACEHOLDER VALUES — edit these once you have BoxNow's real weight
 * brackets/prices. `maxGrams` is the upper bound (inclusive) of each
 * bracket; total order weight above the last bracket's `maxGrams` is
 * not eligible for BoxNow at all.
 */
export const BOXNOW_WEIGHT_TIERS: { maxGrams: number; price: number }[] = [
  { maxGrams: 5000, price: 4.0 }, // up to 5kg -> €4.00
  { maxGrams: 10000, price: 6.0 }, // 5kg-10kg -> €6.00
];

export type BoxNowPricing =
  | { eligible: true; price: number }
  | { eligible: false; price: null };

/** Total order weight (grams) -> BoxNow eligibility + price, using BOXNOW_WEIGHT_TIERS. */
export function getBoxNowPricing(totalGrams: number): BoxNowPricing {
  for (const tier of BOXNOW_WEIGHT_TIERS) {
    if (totalGrams <= tier.maxGrams) {
      return { eligible: true, price: tier.price };
    }
  }
  return { eligible: false, price: null };
}
