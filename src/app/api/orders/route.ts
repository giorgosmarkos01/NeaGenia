import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createPaymentOrder } from "@/lib/viva/createPaymentOrder";

// -- helpers ----------------------------------------------------

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
    await db.query(
      `INSERT INTO carts (id, user_id, status) VALUES (?, ?, 'open')`,
      [newId, userId]
    );
    return { cartId: newId, userId };
  }

  if (cookieCart) return { cartId: cookieCart, userId: null };

  const newId = uuidv4();
  await db.query(`INSERT INTO carts (id, status) VALUES (?, 'open')`, [newId]);
  return { cartId: newId, userId: null };
}

async function fetchCartItems(cartId: string) {
  const [rows]: any = await db.query(
    `
      SELECT
        ci.product_id AS productId,
        i.name        AS name,
        COALESCE(ci.price_at_add, i.price) AS price,
        ci.qty        AS qty
      FROM cart_items ci
      JOIN item i ON i.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC
    `,
    [cartId]
  );
  return rows.map((r: any) => ({
    productId: r.productId,
    name: r.name,
    price: Number(r.price),
    qty: Number(r.qty),
  }));
}

function normShipping(s?: string) {
  const v = (s || "").toUpperCase();
  if (v === "ELTA" || v === "FEDEX" || v === "BOXNOW") return v;
  return "ELTA";
}

// -- POST /api/orders ------------------------------------------

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

  const { cartId, userId } = await getCartIdForCurrentUser();
  const items = await fetchCartItems(cartId);
  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const ship = normShipping(shipping);
  const shippingCost = ship === "ELTA" ? 4.35 : 0;
  const subtotal = items.reduce(
    (sum: number, it: any) => sum + it.price * it.qty,
    0
  );
  const total_amount = Number((subtotal + shippingCost).toFixed(2));
  const order_id = uuidv4();

  try {
    await db.query("START TRANSACTION");

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
        total_amount,
      ]
    );

    for (const it of items) {
      await db.query(
        `INSERT INTO order_items
          (order_id, customer_name, item_name, item_product_code, item_variation_name, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_id, customer_name, it.name, null, null, it.qty, it.price]
      );
    }

    await db.query(
      `INSERT INTO delivery_details
        (order_id, address_line, city, province, zip, country, shipping_option, cost, weight)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, address, city, province, zip, country, ship, shippingCost, 0.0]
    );

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

    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
    await db.query("COMMIT");

    // ✅ Call Viva API AFTER commit
    const vivaResponse = await createPaymentOrder(
      Math.round(total_amount * 100),
      {
        fullName: customer_name,
        email,
        phone: phone_number,
      }
    );
    // ✅ Add this line just before extracting orderCode:
    console.log(
      "[DEBUG Viva full response]",
      JSON.stringify(vivaResponse, null, 2)
    );

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
        total_amount,
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
