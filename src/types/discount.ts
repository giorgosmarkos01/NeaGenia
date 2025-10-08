export type DiscountType = "fixed" | "percent";
export type DiscountScope = "item" | "category";

export interface Discount {
  id: number;
  name: string;
  type: DiscountType;           // 'fixed' | 'percent'
  value: number;                // fixed: euro amount; percent: 0..100
  startsAt: string | null;      // ISO string from DB, or null
  endsAt: string | null;        // ISO string from DB, or null
  stackable: boolean;           // whether this discount can stack with others
  couponCode: string | null;    // null for auto-applied
  scope: DiscountScope;
  appliesTo: {
    itemId?: string;            // when scope === 'item'
    categoryId?: number;        // when scope === 'category'
  };
}

/**
 * Minimal product fields the discount system needs on the frontend.
 * - If you have multi-category products, set `categoryPath` to include all ancestors + self.
 */
export interface DiscountableProductRef {
  id: string;
  price: number;
  categoryId?: number;          // product's category (leaf)
  categoryPath?: number[];      // [root, ..., parent, self] (if available)
}
