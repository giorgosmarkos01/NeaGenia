export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  productCode: string | null;
  hsCode: string | null;
  categoryId: number;
  categoryName: string | null;
  groupId: number | null;
  groupName: string | null;
  stock: number;
  stockStatus: string;
  collaboratorId: number | null;
  descriptionShort: string;
  descriptionFull: string | null;
  specifications: string | null;
  price: string; // DECIMAL from mysql2
  weight: number;
  highlight: 0 | 1;
  createdAt: string;
  updatedAt: string;
  coverImage: string;
  images: { url: string; createdAt: string }[];
  groupItems?: {
    id: string;
    name: string;
    slug: string;
    price: string;
    coverImage: string; 
  }[];
  variations: {
    id: number;
    name: string;
    variationPrice: string;
    selectionType: "optional" | "exclusive";
    createdAt: string;
    updatedAt: string;
  }[];
};

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  coverImage: string;
  descriptionShort: string;
  stockStatus:
  | "available_immediately"
  | "available_after_ordering"
  | "available_3_to_5_days"
  | "available_7_to_10_days"
  | "currently_unavailable"
  | "preorder"
  | "ask_for_price";
}
