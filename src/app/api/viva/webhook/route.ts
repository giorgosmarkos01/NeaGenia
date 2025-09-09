import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SUCCESS_EVENT_TYPE_ID = 1796;
const SUCCESS_STATUS_ID = "F"; // "F" σημαίνει επιτυχής πληρωμή στην Viva
const merchantId = process.env.VIVA_MERCHANT_ID!;
const apiKey = process.env.VIVA_API_KEY!;
// Για την επαλήθευση (Verify) της Viva
export async function GET() {
  return NextResponse.json({
    Key: "35E48D31A649407351E56A5D7FAE05EC300C866B", //curl -X GET https://demo.vivapayments.com/api/messages/config/token \
    //  -H "Authorization: Basic ZTUyODdjMTItZThiNi00OTIzLWI3MTEtZDNmYzI4NjY5OWJhOnpwUlJ1ZA=="
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
