import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SUCCESS_EVENT_TYPE_ID = 1796; // Transaction Payment Created
const FAILED_EVENT_TYPE_ID = 1798; // Transaction Failed
const SUCCESS_STATUS_ID = "F"; // "F" = Finished (επιτυχής πληρωμή)

export async function GET() {
  return NextResponse.json({
    Key: "35E48D31A649407351E56A5D7FAE05EC300C866B",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WEBHOOK] Payload received:", body);

    const { EventTypeId, EventData } = body;

    if (!EventData) {
      console.error("[WEBHOOK] Missing EventData");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { OrderCode, StatusId, TransactionId } = EventData;

    if (!OrderCode || !TransactionId) {
      console.error("[WEBHOOK] Missing essential data:", {
        OrderCode,
        StatusId,
        TransactionId,
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (EventTypeId === SUCCESS_EVENT_TYPE_ID) {
      if (StatusId === SUCCESS_STATUS_ID) {
        await db.execute(
          "UPDATE orders SET payment_status = 'completed' WHERE orderCode = ?",
          [OrderCode.toString()]
        );
        console.log(`[WEBHOOK] Order ${OrderCode} marked as COMPLETED`);
      } else {
        await db.execute(
          "UPDATE orders SET payment_status = 'failed' WHERE orderCode = ?",
          [OrderCode.toString()]
        );
        console.log(
          `[WEBHOOK] Order ${OrderCode} marked as FAILED (StatusId=${StatusId})`
        );
      }
    } else if (EventTypeId === FAILED_EVENT_TYPE_ID) {
      await db.execute(
        "UPDATE orders SET payment_status = 'failed' WHERE orderCode = ?",
        [OrderCode.toString()]
      );
      console.log(`[WEBHOOK] Order ${OrderCode} marked as FAILED (1798 event)`);
    } else {
      console.warn("[WEBHOOK] Unsupported EventTypeId:", EventTypeId);
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
