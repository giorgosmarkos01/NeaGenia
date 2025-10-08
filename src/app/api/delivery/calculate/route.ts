// src/app/api/delivery/calculate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

// If your tsconfig has "resolveJsonModule": true (default in Next),
// you can import JSON directly like this:
import remoteCitiesData from "@/assets/remote_cities_greece.json";
import greekStatesData from "@/assets/greekStates.json";

// ---------- Types ----------
type CartItem = {
  product?: {
    weight?: number; // grams (same as your old app)
    // ...anything else is ignored
  };
  quantity?: number;
};

const BodySchema = z.object({
  city: z.string().min(1),
  province: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  shippingOption: z.string().min(1),
  items: z.array(z.any()), // we'll validate minimally and tolerate shape from old app
});

// ---------- Helpers ----------
/** Sum total order weight in **kilograms** from items (each item's product.weight is in grams). */
function getTotalOrderWeightKg(items: CartItem[]): number {
  let totalGrams = 0;

  if (!Array.isArray(items)) return 0;

  for (const it of items) {
    const grams = Number(it?.product?.weight ?? 0);
    const qty = Number(it?.quantity ?? 0);
    if (Number.isFinite(grams) && Number.isFinite(qty) && qty > 0 && grams >= 0) {
      totalGrams += grams * qty;
    }
  }
  return totalGrams / 1000; // -> kg
}

/** Round DOWN to 0.1 (i.e., one decimal place, floored). */
function roundDownToTenth(n: number): number {
  return Math.floor(n * 10) / 10;
}

/** 
 * Compute ELTA delivery cost for Greece using your exact rules.
 * - Remote zip: base 3.90 + 1.00 per started kg above 2
 * - Non-remote: based on province type (island/mainland/crete/default)
 * - Then add 24% VAT and round DOWN to 0.1
 */
function getGreeceEltaDeliveryCostWithVAT(
  zip: string,
  province: string,
  totalWeightKg: number
): number {
  // 1) Remote cities check by zip
  const isRemote = Array.isArray(remoteCitiesData)
    ? remoteCitiesData.some((entry: any) => String(entry?.zip_code) === String(zip))
    : false;

  let base = 0;
  let extraPerKg = 1.0; // default for all cases except 'crete'

  if (isRemote) {
    base = 3.90; // first 2 kg
    // extraPerKg stays 1.00
  } else {
    // 2) Province type logic
    const state = Array.isArray(greekStatesData)
      ? greekStatesData.find((s: any) => String(s?.region) === String(province))
      : null;
    const type = state?.type as "island" | "mainland" | "crete" | undefined;

    switch (type) {
      case "island":
        base = 3.40;
        extraPerKg = 1.0;
        break;
      case "mainland":
        base = 2.90;
        extraPerKg = 1.0;
        break;
      case "crete":
        base = 2.20;
        extraPerKg = 0.9;
        break;
      default:
        base = 3.90;
        extraPerKg = 1.0;
        break;
    }
  }

  // 3) Add extras if weight > 2 kg (use started kg: Math.ceil)
  let cost = base;
  if (totalWeightKg > 2) {
    const extraKg = Math.ceil(totalWeightKg - 2);
    cost += extraKg * extraPerKg;
  }

  // 4) Add VAT 24% and round DOWN to 0.1
  const withVAT = cost * 1.24;
  return roundDownToTenth(withVAT);
}

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { city, province, zip, country, shippingOption, items } = parsed.data;

    // 1) Total weight (kg)
    const totalWeight = getTotalOrderWeightKg(items);

    // 2) Default (non-Greece or non-ELTA)
    let deliveryCost = 10.0;

    // 3) Greece + ELTA logic
    if (country.toLowerCase() === "greece" && shippingOption.toLowerCase() === "elta") {
      // Make sure minimum required address fields exist (they're validated already)
      deliveryCost = getGreeceEltaDeliveryCostWithVAT(zip, province, totalWeight);
    }

    return NextResponse.json({
      message: "Delivery cost calculated successfully",
      deliveryCost,
      totalWeight, // kg
    });
  } catch (err: any) {
    console.error("[delivery/calculate] error:", err);
    return NextResponse.json(
      { message: "Error calculating delivery cost", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
