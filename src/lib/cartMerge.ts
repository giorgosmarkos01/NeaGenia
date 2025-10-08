import { cookies } from "next/headers";
import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("cartToken")?.value;
  if (!token) return;

  // 1) Find guest cart by session token
  const guest = await queryRows<{ id: string } & RowDataPacket>(
    `SELECT id FROM carts WHERE session_token = ? LIMIT 1`,
    [token]
  );
  if (!guest.length) return;
  const guestCartId = guest[0].id;

  // 2) Ensure user cart exists (or create)
  let userCart = await queryRows<{ id: string } & RowDataPacket>(
    `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (!userCart.length) {
    await queryRows(
      `INSERT INTO carts (user_id, total_price, expires_at, last_access_at) VALUES (?, 0.00, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
      [userId]
    );
    userCart = await queryRows<{ id: string } & RowDataPacket>(
      `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
      [userId]
    );
  }
  const userCartId = userCart[0].id;

  // 3) Move/merge lines
  const guestItems = await queryRows<{ product_id: string; qty: number; price: string } & RowDataPacket>(
    `SELECT product_id, qty, price FROM cart_items WHERE cart_id = ?`,
    [guestCartId]
  );

  for (const gi of guestItems) {
    const [existing] = await queryRows<{ qty: number } & RowDataPacket>(
      `SELECT qty FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [userCartId, gi.product_id]
    );
    if (existing) {
      await queryRows(
        `UPDATE cart_items SET qty = qty + ?, price = ? WHERE cart_id = ? AND product_id = ?`,
        [gi.qty, Number(gi.price), userCartId, gi.product_id]
      );
    } else {
      await queryRows(
        `INSERT INTO cart_items (cart_id, product_id, qty, price) VALUES (?, ?, ?, ?)`,
        [userCartId, gi.product_id, gi.qty, Number(gi.price)]
      );
    }
  }

  // 4) Delete guest cart (and cookie)
  await queryRows(`DELETE FROM carts WHERE id = ?`, [guestCartId]);
  cookieStore.delete("cartToken");

  // 5) Recalc total
  await queryRows(
    `UPDATE carts SET total_price = (
       SELECT COALESCE(SUM(subtotal),0) FROM cart_items WHERE cart_id = ?
     ), last_access_at = NOW()
     WHERE id = ?`,
    [userCartId, userCartId]
  );
}
