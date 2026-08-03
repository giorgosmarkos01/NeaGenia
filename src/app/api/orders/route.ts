export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { createPaymentOrder } from "@/lib/viva/createPaymentOrder";
import { computeOrderTotals } from "@/helpers/itemPricing";
import { applyCouponServerSide } from "@/helpers/couponApply";
import { getOrCreateCartBySession } from "@/lib/cartSession";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getBoxNowPricing } from "@/lib/boxNowPricing";
import { sendOrderConfirmationEmail } from "@/lib/orderConfirmation";
type ShipCode = "ELTA" | "FEDEX" | "BOXNOW";

function normShipping(s?: string): ShipCode {
  const v = (s || "").toUpperCase();
  if (v === "ELTA" || v === "FEDEX" || v === "BOXNOW") return v as ShipCode;
  return "ELTA";
}

// Convert our internal shipping code to DB enum values ('ELTA','FedEx','BoxNow')
function toDbShipEnum(s: ShipCode): "ELTA" | "FedEx" | "BoxNow" {
  if (s === "FEDEX") return "FedEx";
  if (s === "BOXNOW") return "BoxNow";
  return "ELTA";
}

async function getCartIdForCurrentUser() {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const cookieCart = cookieStore.get("cartId")?.value;

  if (userId) {
    const [[row]]: any = await db.query(
      `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (row?.id) return { cartId: row.id, userId };

    const newId = uuidv4();
    await db.query(`INSERT INTO carts (id, user_id) VALUES (?, ?)`, [newId, userId]);
    return { cartId: newId, userId };
  }

  if (cookieCart) return { cartId: cookieCart, userId: null };

  const newId = uuidv4();
  await db.query(`INSERT INTO carts (id) VALUES (?)`, [newId]);
  return { cartId: newId, userId: null };
}

async function getWeightById(
  lines: Array<{ productId: string; qty: number }>
): Promise<Map<string, number>> {
  const weightById = new Map<string, number>();
  if (!lines.length) return weightById;

  const ids = lines.map((l) => l.productId);
  const placeholders = ids.map(() => "?").join(",");
  const [wrows]: any[] = await db.query(
    `SELECT id, weight FROM item WHERE id IN (${placeholders})`,
    ids
  );
  for (const r of wrows || []) {
    weightById.set(String(r.id), Number(r.weight) || 0);
  }
  return weightById;
}

/**
 * Server-validated shipping:
 * - BOXNOW => weight-tiered, see boxNowPricing.ts; rejected if the order is too heavy
 * - FEDEX  => €10
 * - ELTA   => call internal calculator
 */
async function validateShippingCostOnServer(opts: {
  req: Request;
  ship: ShipCode;
  address: { city: string; province: string; zip: string; country: string };
  lines: Array<{ productId: string; qty: number }>;
}): Promise<{ ok: true; cost: number } | { ok: false; error: string }> {
  const { req, ship, address, lines } = opts;

  if (ship === "BOXNOW") {
    const weightById = await getWeightById(lines);
    const totalGrams = lines.reduce(
      (sum, l) => sum + (weightById.get(l.productId) ?? 0) * l.qty,
      0
    );
    const pricing = getBoxNowPricing(totalGrams);
    if (!pricing.eligible) {
      return {
        ok: false,
        error: "This order is too heavy for BoxNow. Please choose another shipping option.",
      };
    }
    return { ok: true, cost: pricing.price };
  }
  if (ship === "FEDEX") return { ok: true, cost: 10.0 };

  if (ship === "ELTA") {
    if (!lines.length) return { ok: true, cost: 4.35 };

    const weightById = await getWeightById(lines);

    const base = new URL(req.url);
    const calcUrl = new URL(
      "/api/delivery/calculate",
      `${base.origin}`
    ).toString();

    const payload = {
      city: address.city,
      province: address.province,
      zip: address.zip,
      country: address.country,
      shippingOption: "ELTA",
      items: lines.map((l) => ({
        product: { weight: weightById.get(l.productId) ?? 0 },
        quantity: l.qty,
      })),
    };

    try {
      const res = await fetch(calcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!res.ok) return { ok: true, cost: 4.35 };
      const data = await res.json();
      const cost = Number(data?.deliveryCost);
      return { ok: true, cost: Number.isFinite(cost) ? cost : 4.35 };
    } catch {
      return { ok: true, cost: 4.35 };
    }
  }

  return { ok: true, cost: 4.35 };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const {
    docType,
    customer_name,
    email,
    phone_number,
    address,
    city,
    province,
    zip,
    country,
    shipping,
    company_name,
    vat_number,
    company_address,
    company_city,
    company_zip,
    occupation,
    tax_office,
    // optional
    coupon,
    // optional BoxNow locker fields if you later want to save them into delivery_details:
    boxnowLockerId,
    boxnowLockerPostalCode,
    boxnowLockerAddressLine1,
  } = body || {};

  // Basic validation
  if (docType !== "receipt" && docType !== "invoice") {
    return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
  }
  if (!customer_name || !email || !phone_number) {
    return NextResponse.json(
      { error: "Missing customer info" },
      { status: 400 }
    );
  }
  if (!address || !city || !province || !zip || !country) {
    return NextResponse.json(
      { error: "Missing delivery info" },
      { status: 400 }
    );
  }
  if (docType === "invoice") {
    if (
      !company_name ||
      !vat_number ||
      !company_address ||
      !company_city ||
      !company_zip ||
      !occupation ||
      !tax_office
    ) {
      return NextResponse.json(
        { error: "Missing invoice info" },
        { status: 400 }
      );
    }
  }

  const { cartId, userId } = await getOrCreateCartBySession(null);
  const ship = normShipping(body.shipping);
  // Authoritative server-side line pricing (discounts, variations, etc.)
  // NOTE: computeOrderTotals currently has a static shipping rule internally;
  // we'll ignore its shippingCost and recompute below.
  const { lines, subtotal } = await computeOrderTotals(cartId, ship);
  if (lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // 2) Server-validated shipping (independent of coupon)
  const forShip = lines.map((l) => ({ productId: l.productId, qty: l.qty }));
  const shippingResult = await validateShippingCostOnServer({
    req,
    ship,
    address: { city, province, zip, country },
    lines: forShip,
  });
  if (!shippingResult.ok) {
    return NextResponse.json({ error: shippingResult.error }, { status: 400 });
  }
  const shippingCost = shippingResult.cost;

  // 3) Apply coupon server-side (only if provided)
  let discountedSubtotal = subtotal;
  let couponToSave: string | null = null;

  if (typeof coupon === "string" && coupon.trim()) {
    const res = await applyCouponServerSide(
      coupon,
      // use UUIDs (productId) to avoid slug ambiguity
      lines.map((l) => ({ identifier: l.productId, qty: l.qty }))
    );

    if (res.reason === "invalid_coupon") {
      // Reject orders with invalid/expired coupon
      return NextResponse.json({ error: "Invalid or expired coupon." }, { status: 400 });
    }

    // Valid coupon (even if not applicable) → use server result
    discountedSubtotal = res.subtotalAfter;
    couponToSave = coupon.trim();
  }

  // 4) Totals: discounted subtotal + validated shipping
  const total = Number((discountedSubtotal + shippingCost).toFixed(2));

  const order_id = uuidv4();

  try {
    await db.query("START TRANSACTION");

    // 5) Insert order (persist coupon_code)
    await db.query(
      `INSERT INTO orders
         (order_id, user_id, customer_name, email, phone_number, total_amount,
          payment_status, order_type, coupon_code, orderCode)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NULL)`,
      [
        order_id,
        userId ?? null,
        customer_name,
        email,
        phone_number,
        total,
        docType,
        couponToSave, // NULL if not provided
      ]
    );

    // 6) Insert order items (your schema stores unit price; total_price is generated)
    for (const l of lines) {
      const variationName = l.variations.length
        ? l.variations.map((v) => v.name).join(", ")
        : null;

      await db.query(
        `INSERT INTO order_items
           (order_id, customer_name, item_name, item_product_code, item_variation_name, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          customer_name,
          l.name,
          null,
          variationName,
          l.qty,
          l.unitPrice,
        ]
      );
    }

    // 7) Delivery details (save normalized shipping option & cost)
    await db.query(
      `INSERT INTO delivery_details
         (order_id, address_line, city, province, zip, country,
          shipping_option, cost, weight,
          box_now_locker_postal_code, box_now_locker_address_line1, box_now_locker_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        address,
        city,
        province,
        zip,
        country,
        toDbShipEnum(ship), // convert to DB enum values
        shippingCost,
        0.0,
        boxnowLockerPostalCode ?? null,
        boxnowLockerAddressLine1 ?? null,
        boxnowLockerId ?? null,
      ]
    );

    // 8) Invoice details when needed
    if (docType === "invoice") {
      await db.query(
        `INSERT INTO invoice_details
           (order_id, company_name, company_address, company_city, company_zip, vat_number, occupation, tax_office)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          company_name,
          company_address,
          company_city,
          company_zip,
          vat_number,
          occupation,
          tax_office,
        ]
      );
    } else {
      // (Optional) create an empty receipt_details row if you want 1:1 parity
      // await db.query(`INSERT INTO receipt_details (order_id) VALUES (?)`, [order_id]);
    }

    // 9) Clear cart
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

    await db.query("COMMIT");

    // 9.5) Order confirmation email to the customer (best-effort, never blocks the response)
    await sendOrderConfirmationEmail({
      orderId: order_id,
      customerName: customer_name,
      customerEmail: email,
      lines: lines.map((l) => ({
        name: l.name,
        qty: l.qty,
        unitPrice: l.unitPrice,
        variationNames: l.variations.length ? l.variations.map((v) => v.name).join(", ") : null,
      })),
      subtotal: discountedSubtotal,
      shippingCost,
      total,
      shippingOption: ship,
      address: { address, city, province, zip, country },
    });

    // 10) Create Viva order using the server-trusted total
    const vivaResponse = await createPaymentOrder(Math.round(total * 100), {
      fullName: customer_name,
      email,
      phone: phone_number,
    });

    const vivaOrderCode = vivaResponse.orderCode?.toString();
    if (!vivaOrderCode) throw new Error("Viva orderCode missing");

    await db.query(`UPDATE orders SET orderCode = ? WHERE order_id = ?`, [
      vivaOrderCode,
      order_id,
    ]);

    return NextResponse.json(
      {
        orderId: order_id,
        orderCode: vivaOrderCode,
        payment_status: "pending",
        total_amount: total,
        redirectUrl: vivaResponse.redirectUrl,
      },
      { status: 201 }
    );
  } catch (e) {
    try {
      await db.query("ROLLBACK");
    } catch {}
    console.error("[orders] create error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
