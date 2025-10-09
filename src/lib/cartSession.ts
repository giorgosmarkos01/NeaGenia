// lib/cartSession.ts
"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { queryRows } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

const COOKIE_NAME = "cartToken";
const CART_TTL_DAYS = 30;
const SECURE_ENV = process.env.NODE_ENV === "production";

type CartRow = { id: string } & RowDataPacket;

function newToken() {
  return crypto.randomUUID();
}

function expireAt(days = CART_TTL_DAYS) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function createGuestCart(sessionToken: string): Promise<string> {
  await queryRows(
    `INSERT INTO carts (session_token, total_price, expires_at, last_access_at)
     VALUES (?, 0.00, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())
     ON DUPLICATE KEY UPDATE last_access_at = VALUES(last_access_at),
                             expires_at = VALUES(expires_at)`,
    [sessionToken, CART_TTL_DAYS]
  );

  const rows = await queryRows<CartRow>(
    `SELECT id FROM carts WHERE session_token = ? LIMIT 1`,
    [sessionToken]
  );
  return rows[0].id;
}

// ✅ Create user cart (idempotent)
async function createUserCart(userId: string): Promise<string> {
  await queryRows(
    `INSERT INTO carts (user_id, total_price, expires_at, last_access_at)
     VALUES (?, 0.00, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())
     ON DUPLICATE KEY UPDATE last_access_at = VALUES(last_access_at),
                             expires_at = VALUES(expires_at)`,
    [userId, CART_TTL_DAYS]
  );

  const rows = await queryRows<CartRow>(
    `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0].id;
}
/**
 * Merge a guest cart (by cookie) into the signed-in user's cart.
 * - Moves/combines cart_items by item_id
 * - Deletes the guest cart and clears cookie
 * - Recalculates user cart total
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  // Find guest cart by session_token
  const guestRows = await queryRows<CartRow>(
    `SELECT id FROM carts WHERE session_token = ? LIMIT 1`,
    [token]
  );
  const guest = guestRows[0];

  if (!guest) {
    // cookie present but cart missing: clean up cookie
    cookieStore.delete(COOKIE_NAME);
    return;
  }
  const guestCartId = guest.id;

  // Ensure user cart exists
  const userRows = await queryRows<CartRow>(
    `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  let userCartId: string;
  if (!userRows[0]) {
    userCartId = await createUserCart(userId);
  } else {
    userCartId = userRows[0].id;
  }

  // Move/merge lines (NB: column is item_id per your schema)
  const guestItems = await queryRows<
    { item_id: string; qty: number; price: string } & RowDataPacket
  >(
    `SELECT item_id, qty, price
       FROM cart_items
      WHERE cart_id = ?`,
    [guestCartId]
  );

  for (const gi of guestItems) {
    const existingRows = await queryRows<{ qty: number } & RowDataPacket>(
      `SELECT qty FROM cart_items WHERE cart_id = ? AND item_id = ?`,
      [userCartId, gi.item_id]
    );
    const existing = existingRows[0];

    if (existing) {
      await queryRows(
        `UPDATE cart_items
            SET qty = qty + ?, price = ?
          WHERE cart_id = ? AND item_id = ?`,
        [gi.qty, Number(gi.price), userCartId, gi.item_id]
      );
    } else {
      await queryRows(
        `INSERT INTO cart_items (cart_id, item_id, qty, price)
         VALUES (?, ?, ?, ?)`,
        [userCartId, gi.item_id, gi.qty, Number(gi.price)]
      );
    }
  }

  // Delete guest cart & cookie
  await queryRows(`DELETE FROM carts WHERE id = ?`, [guestCartId]);
  cookieStore.delete(COOKIE_NAME);

  // Recalc totals & touch timestamps
  await queryRows(
    `UPDATE carts
        SET total_price = (
              SELECT COALESCE(SUM(subtotal), 0)
                FROM cart_items
               WHERE cart_id = ?
            ),
            last_access_at = NOW(),
            updated_at = NOW()
      WHERE id = ?`,
    [userCartId, userCartId]
  );
}

/**
 * getOrCreateCartBySession
 * - If signed in: ensure/return user cart.
 *   If guest cookie exists, merges it into the user cart (idempotent).
 * - If signed out: ensure/return guest cart based on cookie.
 * Always touches last_access_at and keeps a rolling expiry.
 */
export async function getOrCreateCartBySession(_hint: null) {
  const { userId } = await auth();
  const cookieStore = await cookies();

  if (userId) {
    // Merge any leftover guest cart into the user's cart
    const guestToken = cookieStore.get(COOKIE_NAME)?.value;
    if (guestToken) {
      await mergeGuestCartIntoUser(userId);
      // mergeGuestCartIntoUser deletes the cookie if guest cart existed
    }

    // Ensure user cart exists
    const rows = await queryRows<CartRow>(
      `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const existing = rows[0];

    const cartId = existing?.id ?? (await createUserCart(userId));

    // Touch rolling expiry & last access
    await queryRows(
      `UPDATE carts
          SET last_access_at = NOW(),
              expires_at = IF(expires_at IS NULL OR expires_at < NOW(),
                              DATE_ADD(NOW(), INTERVAL ? DAY),
                              expires_at)
        WHERE id = ?`,
      [CART_TTL_DAYS, cartId]
    );

    return { cartId, userId, sessionToken: null as string | null };
  }

  // Guest flow
  let token = cookieStore.get(COOKIE_NAME)?.value ?? null;

  if (token) {
    const rows = await queryRows<
      { id: string; session_token: string | null } & RowDataPacket
    >(
      `SELECT id, session_token
         FROM carts
        WHERE session_token = ?
        LIMIT 1`,
      [token]
    );

    if (rows.length) {
      const cartId = rows[0].id;

      // Touch rolling expiry & last access
      await queryRows(
        `UPDATE carts
            SET last_access_at = NOW(),
                expires_at = IF(expires_at IS NULL OR expires_at < NOW(),
                                DATE_ADD(NOW(), INTERVAL ? DAY),
                                expires_at)
          WHERE id = ?`,
        [CART_TTL_DAYS, cartId]
      );

      return { cartId, userId: null as string | null, sessionToken: token };
    }

    // cookie exists but DB row missing -> fall through to create new
  }

  // Create a new guest cart + cookie
  token = newToken();
  const newCartId = await createGuestCart(token);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: SECURE_ENV,
    expires: expireAt(),
  });

  return {
    cartId: newCartId,
    userId: null as string | null,
    sessionToken: token,
  };
}
