import { getAccessToken } from "./getAccessToken";

export interface VivaCustomer {
  fullName: string;
  email: string;
  phone: string;
  countryCode?: string;
}

function isDemo() {
  // set VIVA_ENV=demo in your demo server
  return (process.env.VIVA_ENV || "").toLowerCase() === "demo";
}

const API_BASE = isDemo()
  ? "https://demo-api.vivapayments.com"
  : "https://api.vivapayments.com";

const FALLBACK_CHECKOUT_BASE = isDemo()
  ? "https://demo.vivapayments.com/web/checkout?ref="
  : "https://www.vivapayments.com/web/checkout?ref="; // <-- include www

export async function createPaymentOrder(amount: number, customer: VivaCustomer) {
  console.log("[createPaymentOrder] Start", { amount, customer, api: API_BASE });

  const accessToken = await getAccessToken();
  console.log("[DEBUG AccessToken]", accessToken ? "[OK]" : "[MISSING]");

  const res = await fetch(`${API_BASE}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount, // integer in cents
      customerTrns: "Nea Genia Technologies Eshop Purchase",
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        countryCode: customer.countryCode ?? "GR",
      },
      sourceCode: process.env.VIVA_SOURCE_CODE,
      preAuth: false,
      allowRecurring: false,
      paymentTimeout: 300,
      // make sure this is your prod domain in prod & demo domain in demo if needed
      returnUrl: process.env.VIVA_RETURN_URL || "https://neageniatechnologies.com/success",
    }),
  });

  const text = await res.text();
  console.log("[DEBUG createPaymentOrder RESPONSE TEXT]", text);

  if (!res.ok) {
    throw new Error("Failed to create payment order");
  }

  let parsed: any = {};
  try {
    parsed = JSON.parse(text || "{}");
  } catch {
    // will rely on fallback below
  }

  const orderCode: string | undefined = parsed.orderCode;
  const redirectUrl: string | undefined =
    parsed.redirectUrl || parsed.checkoutUrl || parsed.payUrl;

  const finalRedirect =
    redirectUrl || (orderCode ? `${FALLBACK_CHECKOUT_BASE}${orderCode}` : undefined);

  if (!orderCode || !finalRedirect) {
    console.error("[createPaymentOrder] Missing orderCode or redirect URL", { parsed });
    throw new Error("Failed to create payment order");
  }

  console.log("[createPaymentOrder] OK", { orderCode, redirect: finalRedirect });

  return {
    orderCode,
    redirectUrl: finalRedirect,
  };
}
