import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop(); // Extract το ID από το URL

  try {
    await db.query(
      `INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
      [userId, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[wishlist] POST error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop();

  try {
    await db.query(
      `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[wishlist] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
