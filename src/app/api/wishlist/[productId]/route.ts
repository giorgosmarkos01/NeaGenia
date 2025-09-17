import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// ✅ POST: Add to wishlist
export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } } // ✅ σωστό destructuring
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = params.productId;

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

// ✅ DELETE: Remove from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } } // ✅ ίδιο πράγμα
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = params.productId;

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
