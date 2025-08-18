import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  // Empty / too short → no query to DB
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const like = `%${q}%`;
    const [rows]: any = await db.query(
      `
      SELECT
        i.id,
        i.name,
        i.slug,
        i.price,
        (
          SELECT ii.imageUrl
          FROM item_images ii
          WHERE ii.item_id = i.id
          ORDER BY ii.created_at ASC
          LIMIT 1
        ) AS imageUrl
      FROM item i
      WHERE i.name LIKE ? OR i.slug LIKE ? OR i.description_short LIKE ?
      ORDER BY i.highlight DESC, i.created_at DESC
      LIMIT 10
    `,
      [like, like, like]
    );

    // Cast price to number
    const items = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: Number(r.price),
      imageUrl: r.imageUrl || null,
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
