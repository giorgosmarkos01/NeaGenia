import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { OrderCode, TransactionId, StatusId } = body;

  if (!OrderCode || !TransactionId) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  try {
    if (StatusId === "F") {
      await db.query(
        `UPDATE orders SET payment_status = 'completed' WHERE orderCode = ?`,
        [String(OrderCode)]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
