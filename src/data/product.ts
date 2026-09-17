import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import type { ProductSummary, ProductDetail } from "@/types/product";
import { fetchDiscountsForProducts, applyDiscountsForItem } from "@/lib/discountPricing";

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || "";
const FALLBACK_IMAGE = "/logo.png";

function normalizeSummaryRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    categoryId: row.categoryId,
    stock: row.stock,
    descriptionShort: row.descriptionShort ?? row.description_short ?? "",
    // <-- the important bit: prefer camelCase, fall back to snake_case
    stockStatus: row.stockStatus ?? row.stock_status ?? "",
    coverImage: toAbs(row.coverImage ?? row.cover_image ?? null),
  };
}

/** Batch-computes effectivePrice/isOnSale for a list of products, using the
 *  same discount logic as the cart and checkout so prices stay consistent. */
async function withDiscounts<
  T extends { id: string; price: number | string; categoryId: number | null }
>(products: T[]): Promise<(T & { effectivePrice: number; isOnSale: boolean })[]> {
  if (products.length === 0) return [];

  const discounts = await fetchDiscountsForProducts(products.map((p) => p.id));
  return products.map((p) => {
    const basePrice = Number(p.price);
    const effectivePrice = discounts.length
      ? applyDiscountsForItem(basePrice, p.id, p.categoryId, discounts)
      : basePrice;
    return { ...p, effectivePrice, isOnSale: effectivePrice < basePrice };
  });
}

type ProductSummaryRow = ProductSummary & RowDataPacket;
type ProductDetailRow = ProductDetail & RowDataPacket;

// Row shapes = one element of the array fields in ProductDetail
type ImageDTO = ProductDetail["images"][number];
type VariationDTO = ProductDetail["variations"][number];
type ImageRow = ImageDTO & RowDataPacket;
type VariationRow = VariationDTO & RowDataPacket;

type CategoryCount = {
  slug: string;
  name: string;
  count: number;
} & RowDataPacket;

const toAbs = (u?: string | null): string => {
  if (!u || !u.trim()) return FALLBACK_IMAGE;      // <- always string
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${CDN_BASE}${u}`;
  return `${CDN_BASE}/${u}`;
};

// Reusable SELECT (cover image + common fields)
const BASE_SELECT = `
  SELECT
    i.id, i.name, i.slug, i.price, i.stock, i.category_id AS categoryId,
    i.description_short AS descriptionShort,
    i.stock_status as stockStatus,
    (
      SELECT imageUrl
      FROM item_images img
      WHERE img.item_id = i.id
      ORDER BY img.created_at ASC 
      LIMIT 1
    ) AS coverImage
  FROM item i
`;

// Utility: turn a category name into a slug-like token
// e.g. "Robot Kits" -> "robot-kits"
function slugifyNameForMatch() {
  // returns SQL expression to compare against a param
  // LOWER(REPLACE(c.name,' ','-')) = LOWER(?)
  return `LOWER(REPLACE(c.name, ' ', '-')) = LOWER(?)`;
}

/* -------- Concrete fetchers -------- */

export async function fetchProductsAll(limit = 24): Promise<ProductSummary[]> {
  const rows = await queryRows<ProductSummaryRow>(
    `${BASE_SELECT}
     ORDER BY i.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return withDiscounts(rows.map(normalizeSummaryRow));
}

export async function fetchProductsPopular(limit = 24): Promise<ProductSummary[]> {
  const rows = await queryRows<ProductSummaryRow>(
    `${BASE_SELECT}
     WHERE i.highlight = 1
     ORDER BY i.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return withDiscounts(rows.map(normalizeSummaryRow));
}

export async function fetchProductsByCategory(
  category: string,
  limit = 24
): Promise<ProductSummary[]> {
  const rows = await queryRows<ProductSummaryRow>(
    `
    ${BASE_SELECT}
    INNER JOIN category c ON c.id = i.category_id
    WHERE (c.name = ? OR ${slugifyNameForMatch()})
    ORDER BY i.created_at DESC
    LIMIT ?
  `,
    [category, category, limit]
  );
  return withDiscounts(rows.map(normalizeSummaryRow));
}

export async function fetchRelatedProducts(
  categoryId: number | null,
  excludeId: string,
  limit = 4
): Promise<ProductSummary[]> {
  if (!categoryId) return [];
  const rows = await queryRows<ProductSummaryRow>(
    `${BASE_SELECT}
     WHERE i.category_id = ? AND i.id <> ?
     ORDER BY i.created_at DESC
     LIMIT ?`,
    [categoryId, excludeId, limit]
  );
  return withDiscounts(rows.map(normalizeSummaryRow));
}

/* -------- Cached getters (10 min) -------- */

export async function getProductsAll(limit = 24) {
  const cached = unstable_cache(
    () => fetchProductsAll(limit),
    ["products-all", String(limit)],
    { revalidate: 600, tags: ["products"] }
  );
  return cached();
}

export async function getProductsPopular(limit = 24) {
  const cached = unstable_cache(
    () => fetchProductsPopular(limit),
    ["products-popular", String(limit)],
    { revalidate: 600, tags: ["products"] }
  );
  return cached();
}

export async function getProductsByCategory(category: string, limit = 24) {
  const key = (category ?? "").trim().toLowerCase();

  if (key === "all-items") return getProductsAll(limit);
  if (key === "popular") return getProductsPopular(limit);

  const cached = unstable_cache(
    () => fetchProductsByCategory(key, limit),
    ["products-by-category", key, String(limit)],
    { revalidate: 600, tags: ["products"] }
  );
  return cached();
}

export async function getRelatedProducts(
  categoryId: number | null,
  excludeId: string,
  limit = 4
) {
  if (!categoryId) return [];
  const cached = unstable_cache(
    () => fetchRelatedProducts(categoryId, excludeId, limit),
    ["products-related", String(categoryId), excludeId, String(limit)],
    { revalidate: 600, tags: ["products"] }
  );
  return cached();
}

/* -------- Category counts (with virtual categories) -------- */

export async function getCategoryCounts() {
  const cached = unstable_cache(
    async () => {
      // Real DB categories with counts
      const rows = await queryRows<CategoryCount>(
        `
        SELECT 
          LOWER(REPLACE(c.name, ' ', '-')) AS slug,
          c.name AS name,
          COUNT(i.id) AS count
        FROM category c
        LEFT JOIN item i ON i.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
      `
      );

      // Virtual categories
      const [{ count: popularCount }] = await queryRows<
        { count: number } & RowDataPacket
      >(`SELECT COUNT(*) AS count FROM item WHERE highlight = 1`);

      const [{ count: allCount }] = await queryRows<
        { count: number } & RowDataPacket
      >(`SELECT COUNT(*) AS count FROM item`);

      // Prepend virtual categories
      return [
        { slug: "popular", name: "Popular", count: popularCount },
        { slug: "all-items", name: "All Items", count: allCount },
        ...rows,
      ];
    },
    ["category-counts"],
    { revalidate: 600, tags: ["products"] }
  );

  return cached();
}

export async function getItemDetailBySlug(slug: string): Promise<ProductDetail | null> {
  // 1) Item (with category & group names)
  const itemRows = await queryRows<ProductDetailRow>(
    `
    SELECT 
      i.id, i.name, i.slug, 
      i.product_code AS productCode,
      i.hs_code AS hsCode,
      i.category_id AS categoryId, c.name AS categoryName,
      i.group_id AS groupId, g.name AS groupName,
      i.stock, i.stock_status AS stockStatus,
      i.collaborator_id AS collaboratorId,
      i.description_short AS descriptionShort,
      i.description_full AS descriptionFull,
      i.specifications,
      i.price, i.weight, i.highlight,
      i.created_at AS createdAt, i.updated_at AS updatedAt
    FROM item i
    LEFT JOIN category c ON c.id = i.category_id
    LEFT JOIN item_group g ON g.id = i.group_id
    WHERE i.slug = ?
    LIMIT 1
    `,
    [slug]
  );

  if (!itemRows.length) return null;
  const item = itemRows[0];

  // 2) Images (ordered)
  const imageRows = await queryRows<
    { imageUrl: string | null; createdAt: string } & RowDataPacket
  >(`
    SELECT imageUrl, created_at AS createdAt
    FROM item_images
    WHERE item_id = ?
    ORDER BY created_at ASC
  `, [item.id]);

  const images: ProductDetail["images"] = imageRows.map((r) => ({
    url: toAbs(r.imageUrl),  // <- now always string
    createdAt: r.createdAt,
  }));

  // 3) Variations
  const variationRows = await queryRows<
    {
      id: number;
      name: string;
      variationPrice: string;
      selectionType: "optional" | "exclusive";
      createdAt: string;
      updatedAt: string;
    } & RowDataPacket
  >(
    `
    SELECT 
      id,
      name,
      variation_price AS variationPrice,
      selection_type AS selectionType,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM item_variation
    WHERE item_id = ?
    ORDER BY id ASC
    `,
    [item.id]
  );

  // 4) group siblings
  let groupItems: ProductDetail["groupItems"] = [];
  if (item.groupId) {
    const groupRows = await queryRows<
      {
        id: string;
        name: string;
        slug: string;
        price: string;
        coverImage: string | null;
      } & RowDataPacket
    >(
      `
      SELECT 
        i.id, i.name, i.slug, i.price,
        (
          SELECT imageUrl
          FROM item_images img
          WHERE img.item_id = i.id
          ORDER BY img.created_at ASC
          LIMIT 1
        ) AS coverImage
      FROM item i
      WHERE i.group_id = ? AND i.id <> ?
      ORDER BY i.created_at DESC
      `,
      [item.groupId, item.id]
    );

    groupItems = groupRows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      coverImage: toAbs(r.coverImage) ?? FALLBACK_IMAGE,
    }));
  }

  const coverImage = images.length ? images[0].url : FALLBACK_IMAGE;

  const discounts = await fetchDiscountsForProducts([item.id]);
  const basePrice = Number(item.price);
  const effectivePrice = discounts.length
    ? applyDiscountsForItem(basePrice, item.id, item.categoryId, discounts)
    : basePrice;

  const payload: ProductDetail = {
    ...item,
    coverImage,
    images,
    variations: variationRows,
    groupItems,
    effectivePrice,
    isOnSale: effectivePrice < basePrice,
  };

  return payload;
}
