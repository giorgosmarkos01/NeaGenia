// Base definition of all shipping options
export const SHIP_OPTIONS = {
  GR: ["ELTA", "BoxNow"] as const,
  INTL: ["FedEx"] as const,
};

// Convenience merged array if you ever need "all"
export const ALL_SHIP_OPTIONS = [
  ...SHIP_OPTIONS.GR,
  ...SHIP_OPTIONS.INTL,
] as const;

// Strong type
export type ShippingOption = typeof ALL_SHIP_OPTIONS[number];

// Optional helper to get options by country code
export function getShippingOptions(country: string): ShippingOption[] {
  return country === "Greece" ? [...SHIP_OPTIONS.GR] : [...SHIP_OPTIONS.INTL];
}
