// src/app/api/viva/create-payment-order/route.ts
import { createPaymentOrder } from "@/lib/viva/createPaymentOrder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[DEBUG] Request Body:", body);

    const { amount, customer } = body;
    if (!amount || !customer) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400 }
      );
    }

    const data = await createPaymentOrder(amount, customer);
    return Response.json(data);
  } catch (err: any) {
    console.error("[create-payment-order] error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
