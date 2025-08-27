// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

// ------------------ helpers ------------------

function genOrderCode() {
  // Temporary human-readable code until Viva is integrated
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${y}${m}${day}-${rand}`;
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
    if (row?.id) return { cartId: row.id as string, userId };

    const newId = uuidv4();
    await db.query(
      `INSERT INTO carts (id, user_id, status) VALUES (?, ?, 'open')`,
      [newId, userId]
    );
    return { cartId: newId, userId };
  }

  // guest cart
  if (cookieCart) return { cartId: cookieCart as string, userId: null };

  const newId = uuidv4();
  await db.query(`INSERT INTO carts (id, status) VALUES (?, 'open')`, [newId]);
  return { cartId: newId, userId: null };
}

type CartItemRow = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

async function fetchCartItems(cartId: string): Promise<CartItemRow[]> {
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

function normaliseShipping(input: unknown): "ELTA" | "FedEx" | "BoxNow" {
  const s = String(input || "").toUpperCase();
  if (s === "ELTA") return "ELTA";
  if (s === "FEDEX") return "FedEx";
  if (s === "BOXNOW") return "BoxNow";
  // default
  return "ELTA";
}

// ------------------ POST /api/orders (RECEIPT ONLY) ------------------

export async function POST(req: Request) {
  // Expect JSON body from checkout form
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  // Required fields for a receipt
  const {
    customer_name,
    email,
    phone_number,
    address, // address_line
    city,
    province,
    zip,
    country = "Greece",
    shipping, // e.g. "elta" from UI
    docType, // must be "receipt" for now
  } = body;

  if (docType !== "receipt") {
    return NextResponse.json(
      { error: "Only receipt flow is enabled for now." },
      { status: 400 }
    );
  }

  // Basic validation – required fields for receipt + delivery row
  if (
    !customer_name ||
    !email ||
    !phone_number ||
    !address ||
    !city ||
    !zip ||
    !country ||
    !province
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const { cartId, userId } = await getCartIdForCurrentUser();

    // 1) Only trust DB for cart contents
    const items = await fetchCartItems(cartId);
    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2) Server-side totals
    const subtotal = items.reduce(
      (s: number, it: { price: number; qty: number }) => s + it.price * it.qty,
      0
    );
    const shippingEnum = normaliseShipping(shipping);
    const deliveryCost = shippingEnum === "ELTA" ? 4.35 : 0.0; // tweak if you add FedEx/BoxNow
    const total_amount = Number((subtotal + deliveryCost).toFixed(2));

    const order_id = uuidv4();
    const orderCode = genOrderCode();

    // 3) Transaction: orders → order_items → delivery_details → clear cart
    await db.query("START TRANSACTION");

    // orders row
    await db.query(
      `INSERT INTO orders
       (order_id, user_id, customer_name, email, phone_number, order_type, total_amount, payment_status, orderCode)
       VALUES (?, ?, ?, ?, ?, 'receipt', ?, 'pending', ?)`,
      [
        order_id,
        userId ?? null,
        customer_name,
        email,
        phone_number,
        total_amount,
        orderCode,
      ]
    );

    // order_items rows — per your schema (NO product_id field)
    // order_items: order_item_id (auto), order_id, customer_name, item_name,
    // item_product_code (NULL), item_variation_name (NULL), quantity, price, total_price (generated)
    for (const it of items) {
      await db.query(
        `INSERT INTO order_items
         (order_id, customer_name, item_name, item_product_code, item_variation_name, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id,
          customer_name,
          it.name,
          null, // item_product_code (optional)
          null, // item_variation_name (optional)
          it.qty,
          it.price,
        ]
      );
    }

    // delivery_details row
    await db.query(
      `INSERT INTO delivery_details
       (order_id, address_line, city, province, zip, country, shipping_option, cost, weight,
        box_now_locker_postal_code, box_now_locker_address_line1, box_now_locker_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        address,
        city,
        province ?? null,
        zip,
        country,
        shippingEnum,
        deliveryCost,
        0.0, // weight — compute later if needed
        null,
        null,
        null,
      ]
    );

    // clear cart items (keep the cart row “open”)
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

    await db.query("COMMIT");

    return NextResponse.json(
      {
        orderId: order_id,
        orderCode, // temporary code; replace with Viva transaction info later
        payment_status: "pending",
        total_amount,
      },
      { status: 201 }
    );
  } catch (e: any) {
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
