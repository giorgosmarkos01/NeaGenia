export interface Product {
  id: string;
  name: string;
  slug: string;
  product_code?: string;
  hs_code?: string;
  category_id: number;
  group_id?: number;
  stock: number;
  stock_status:
    | "available_immediately"
    | "available_after_ordering"
    | "available_3_to_5_days"
    | "available_7_to_10_days"
    | "currently_unavailable"
    | "preorder"
    | "ask_for_price";
  collaborator_id?: number;
  description_short: string;
  description_full?: string;
  specifications?: string;
  price: number;
  weight: number;
  highlight: 0 | 1;
  created_at?: Date;
  updated_at?: Date;
  images?: string[];
  collaborator_name?: string;
  category_name?: string;
}
