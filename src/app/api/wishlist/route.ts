import { db } from "@/lib/db";
import { Product } from "@/types/product";

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const [rows]: any[] = await db.query(
    `
    SELECT 
      i.id,
      i.name,
      i.slug,
      i.product_code,
      i.hs_code,
      i.category_id,
      i.group_id,
      i.stock,
      i.stock_status,
      i.collaborator_id,
      i.description_short,
      i.description_full,
      i.specifications,
      i.price,
      i.weight,
      i.highlight,
      i.created_at,
      i.updated_at,
      c.name as collaborator_name,
      cat.name as category_name
    FROM wishlist_items wi
    JOIN item i ON i.id = wi.product_id
    LEFT JOIN collaborators c ON c.id = i.collaborator_id
    LEFT JOIN categories cat ON cat.id = i.category_id
    WHERE wi.user_id = ?
    ORDER BY wi.created_at DESC
    `,
    [userId]
  );

  return rows.map(
    (item: any): Product => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      product_code: item.product_code ?? undefined,
      hs_code: item.hs_code ?? undefined,
      category_id: item.category_id,
      group_id: item.group_id ?? undefined,
      stock: item.stock,
      stock_status: item.stock_status,
      collaborator_id: item.collaborator_id ?? undefined,
      description_short: item.description_short ?? "",
      description_full: item.description_full ?? undefined,
      specifications: item.specifications ?? undefined,
      price: parseFloat(item.price),
      weight: parseFloat(item.weight),
      highlight: item.highlight,
      created_at: item.created_at ? new Date(item.created_at) : undefined,
      updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
      images: [], // <-- Αν έχεις πίνακα `product_images`, μπορείς να το γεμίσεις
      collaborator_name: item.collaborator_name ?? undefined,
      category_name: item.category_name ?? undefined,
    })
  );
}
