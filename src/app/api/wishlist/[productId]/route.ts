import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Context = {
  params: {
    productId: string;
  };
};

export async function POST(req: NextRequest, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = context.params.productId;

  try {
    await db.query(
      `INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
      [userId, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[wishlist] POST error:", error);
    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = context.params.productId;

  try {
    await db.query(
      `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[wishlist] DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}
