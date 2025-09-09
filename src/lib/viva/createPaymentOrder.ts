// src/lib/viva/createPaymentOrder.ts
import { getAccessToken } from "./getAccessToken";

export interface VivaCustomer {
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
}

export async function createPaymentOrder(
  amount: number,
  customer: VivaCustomer
) {
  console.log("[createPaymentOrder] Start", { amount, customer });

  const accessToken = await getAccessToken();
  console.log("[DEBUG AccessToken]", accessToken);

  const res = await fetch(
    "https://demo-api.vivapayments.com/checkout/v2/orders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        customerTrns: "Your Eshop Purchase",
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          countryCode: customer.countryCode ?? "GR",
        },
        sourceCode: process.env.VIVA_SOURCE_CODE, //
        preAuth: false,
        allowRecurring: false,
        paymentTimeout: 300,
        returnUrl: "https://efthymios.vercel.app/thank-you", // ✅ Χρειάζεται για redirect
      }),
    }
  );

  const text = await res.text();
  console.log("[DEBUG createPaymentOrder RESPONSE TEXT]", text);

  if (!res.ok) {
    throw new Error("Failed to create payment order");
  }

  const parsed = JSON.parse(text);
  console.log("[DEBUG createPaymentOrder PARSED RESPONSE]", parsed);

  // ✅ fallback για redirectUrl αν λείπει (π.χ. παλιό bug ή misconfig)
  const redirectUrl =
    parsed.redirectUrl ||
    `https://demo.vivapayments.com/web/checkout?ref=${parsed.orderCode}`;

  return {
    orderCode: parsed.orderCode,
    redirectUrl,
  };
}
