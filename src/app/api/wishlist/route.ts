import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows]: any = await db.query(
    `
    SELECT wi.product_id, i.name, i.slug, i.price 
    FROM wishlist_items wi
    JOIN item i ON i.id = wi.product_id
    WHERE wi.user_id = ?
    ORDER BY wi.created_at DESC
    `,
    [userId]
  );

  return NextResponse.json(rows);
}
