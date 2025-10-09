import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { createPaymentOrder } from "@/lib/viva/createPaymentOrder";
import { computeOrderTotals } from "@/helpers/itemPricing"; // authoritative line pricing
import { getOrCreateCartBySession } from "@/lib/cartSession";
type ShipCode = "ELTA" | "FEDEX" | "BOXNOW";

function normShipping(s?: string): ShipCode {
  const v = (s || "").toUpperCase();
  if (v === "ELTA" || v === "FEDEX" || v === "BOXNOW") return v as ShipCode;
  return "ELTA";
}

/**
 * Get validated shipping cost on the server.
 * - BOXNOW => €3 (per your request)
 * - ELTA   => call your own internal API /api/delivery/calculate to reuse JSON rules
 * - FEDEX  => €0 (adjust if needed)
 */
async function validateShippingCostOnServer(opts: {
  req: Request;
  ship: ShipCode;
  address: { city: string; province: string; zip: string; country: string };
  lines: Array<{ productId: string; qty: number }>;
}): Promise<number> {
  const { req, ship, address, lines } = opts;

  if (ship === "BOXNOW") return 3.0; // <-- fixed per your requirement
  if (ship === "FEDEX") return 0.0; // change as needed

  if (ship === "ELTA") {
    // Fetch item weights to pass to the calculator (expects grams)
    if (!lines.length) return 4.35;

    const ids = lines.map((l) => l.productId);
    const placeholders = ids.map(() => "?").join(",");
    const [wrows]: any[] = await db.query(
      `SELECT id, weight FROM item WHERE id IN (${placeholders})`,
      ids
    );
    const weightById = new Map<string, number>();
    for (const r of wrows || []) {
      weightById.set(String(r.id), Number(r.weight) || 0);
    }

    // Build payload for internal API using absolute URL derived from incoming req
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
        // The internal route does not need auth; if it does, forward cookies/headers here.
        body: JSON.stringify(payload),
        // No-cache: every calculation should be fresh
        cache: "no-store",
      });

      if (!res.ok) {
        // fallback if calculator fails
        return 4.35;
      }
      const data = await res.json();
      const cost = Number(data?.deliveryCost);
      return Number.isFinite(cost) ? cost : 4.35;
    } catch {
      return 4.35;
    }
  }

  // Default fallback
  return 4.35;
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

  // Build a light list for shipping calc (productId + qty)
  const forShip = lines.map((l) => ({ productId: l.productId, qty: l.qty }));

  // ✅ Server-validated shipping
  const shippingCost = await validateShippingCostOnServer({
    req,
    ship,
    address: { city, province, zip, country },
    lines: forShip,
  });

  // Final total from authoritative subtotal + validated shipping
  const total = Number((subtotal + shippingCost).toFixed(2));

  const order_id = uuidv4();

  try {
    await db.query("START TRANSACTION");

    // Orders
    await db.query(
      `INSERT INTO orders
        (order_id, user_id, customer_name, email, phone_number, order_type, total_amount, payment_status, orderCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NULL)`,
      [
        order_id,
        userId ?? null,
        customer_name,
        email,
        phone_number,
        docType,
        total,
      ]
    );

    // Order items
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

    // Delivery details (save the validated shipping cost)
    await db.query(
      `INSERT INTO delivery_details
         (order_id, address_line, city, province, zip, country, shipping_option, cost, weight)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, address, city, province, zip, country, ship, shippingCost, 0.0]
    );

    // Invoice details
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
    }

    // Clear cart
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

    await db.query("COMMIT");

    // Create Viva order using validated total
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
