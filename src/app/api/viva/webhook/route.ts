import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SUCCESS_EVENT_TYPE_ID = 1796;
const SUCCESS_STATUS_ID = "F"; // "F" σημαίνει επιτυχής πληρωμή στην Viva

// Για την επαλήθευση (Verify) της Viva
export async function GET() {
  return NextResponse.json({
    Key: "e5287c12-e8b6-4923-b711-d3fc286699ba", // άλλαξε με το δικό σου!
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WEBHOOK] Payload received:", body);

    const { EventTypeId, EventData } = body;

    if (EventTypeId !== SUCCESS_EVENT_TYPE_ID) {
      console.warn("[WEBHOOK] Unsupported EventTypeId:", EventTypeId);
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const { OrderCode, StatusId, Amount, TransactionId } = EventData;

    if (!OrderCode || !StatusId || !TransactionId) {
      console.error("[WEBHOOK] Missing essential data:", {
        OrderCode,
        StatusId,
        TransactionId,
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ Ελέγχουμε αν είναι επιτυχής
    if (StatusId === SUCCESS_STATUS_ID) {
      // Ενημερώνουμε την παραγγελία ως completed
      await db.execute(
        "UPDATE orders SET payment_status = 'completed' WHERE orderCode = ?",
        [OrderCode.toString()]
      );
      console.log(`[WEBHOOK] Order ${OrderCode} marked as COMPLETED`);
    } else {
      // αλλιώς θεωρούμε ότι απέτυχε
      await db.execute(
        "UPDATE orders SET payment_status = 'failed' WHERE orderCode = ?",
        [OrderCode.toString()]
      );
      console.log(`[WEBHOOK] Order ${OrderCode} marked as FAILED`);
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
