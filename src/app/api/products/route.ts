import { NextResponse } from "next/server";
import { db, queryRows } from "@/lib/db";
import { unstable_cache, revalidateTag } from "next/cache";
import { ProductSummary } from "@/types/product";

export const runtime = "nodejs"; // required for mysql2

const getAllProductsCached = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    const rows =  await queryRows<ProductSummary[]>(
      `
      SELECT
        i.id, i.slug, i.name, i.price,
        i.description_short AS descriptionShort,
        (SELECT ii.imageUrl
         FROM item_images ii
         WHERE ii.item_id = i.id
         ORDER BY ii.created_at ASC
         LIMIT 1) AS imageUrl
      FROM item i
      ORDER BY i.created_at DESC
      `
    );
  },
  ["products-all"],     // cache key & tag
  { revalidate: 300 }   // TTL (seconds)
);

export async function GET() {
  const items = await getAllProductsCached();

  // Helps CDN caching too (Vercel etc.)
  const res = NextResponse.json({ items });
  res.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=59");
  return res;
}

// Example invalidation endpoint (optional):
export async function POST() {
  revalidateTag("products-all");
  return NextResponse.json({ ok: true });
}
