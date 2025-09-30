import { unstable_cache } from "next/cache";
import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import type { ProductSummary } from "@/types/product";

type ProductSummaryRow = ProductSummary & RowDataPacket;

export async function fetchProductsFromDB(): Promise<ProductSummary[]> {
  const rows = await queryRows<ProductSummaryRow>(`
    SELECT 
      i.id, i.name, i.slug, i.price, i.stock, i.description_short AS descriptionShort, i.stock_status,
      (
        SELECT imageUrl
        FROM item_images img
        WHERE img.item_id = i.id
        ORDER BY img.created_at ASC 
        LIMIT 1
      ) AS coverImage
    FROM item i
    WHERE i.highlight = 1
    ORDER BY i.created_at DESC
  `);
  return rows; // structurally matches ProductSummary[]
}

// Cache for 600 seconds (10 minutes)
export const getAllProducts = unstable_cache(
  fetchProductsFromDB,
  ["products-all"],              // cache key
  { revalidate: 600 }            // TTL in seconds
);
