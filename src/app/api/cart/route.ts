import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Βοηθητικό: φτιάχνει ενιαίο shape και κάνει cast την τιμή σε number
function mapRows(rows: any[]) {
  return rows.map((r) => ({
    productId: r.productId,
    slug: r.slug,
    name: r.name,
    price: Number(r.price),
    qty: Number(r.qty),
    // πρώτο image (path). Στο UI θα κάνεις baseUrl + imageUrl
    imageUrl: r.imageUrl || null,
  }));
}

// Κοινό query για να επιστρέφουμε ενημερωμένη λίστα
async function fetchCartItems(cartId: string) {
  const [rows]: any = await db.query(
    `
    SELECT
      ci.product_id AS productId,
      i.slug AS slug,
      i.name AS name,
      COALESCE(ci.price_at_add, i.price) AS price,
      ci.qty AS qty,
      (
        SELECT ii.imageUrl
        FROM item_images ii
        WHERE ii.item_id = i.id
        ORDER BY ii.created_at ASC
        LIMIT 1
      ) AS imageUrl
    FROM cart_items ci
    JOIN item i ON i.id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at ASC
    `,
    [cartId]
  );
  return mapRows(rows);
}

export async function GET() {
  const cookieStore = await cookies(); // <-- ΧΩΡΙΣ await
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return NextResponse.json({ cartId: null, items: [] });
  }

  const items = await fetchCartItems(cartId);
  return NextResponse.json({ cartId, items });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  let createdCart = false;

  const { productId, qty = 1, price } = await req.json();
  if (!productId || qty < 1) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Αν δεν υπάρχει cart, φτιάξ’ το
  if (!cartId) {
    cartId = uuidv4();
    await db.query(`INSERT INTO carts (id) VALUES (?)`, [cartId]);
    createdCart = true;
  }

  // Τιμή από DB αν δεν δόθηκε
  const [[product]]: any = await db.query(
    `SELECT price FROM item WHERE id = ?`,
    [productId]
  );
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const priceToUse = price ?? product.price;

  // insert ή αύξηση qty
  await db.query(
    `
    INSERT INTO cart_items (cart_id, product_id, qty, price_at_add)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)
    `,
    [cartId, productId, qty, priceToUse]
  );

  const items = await fetchCartItems(cartId);

  // Θέσε cookie πάνω στην απόκριση όταν δημιουργήθηκε τώρα
  const res = NextResponse.json({ cartId, items });
  if (createdCart) {
    res.cookies.set("cartId", cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 μέρες
    });
  }
  return res;
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId) {
    return NextResponse.json({ error: "No cart" }, { status: 400 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  await db.query(
    `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
    [cartId, productId]
  );

  const items = await fetchCartItems(cartId);
  return NextResponse.json({ cartId, items });
}
