"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/store/cartSlice";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store/store"; // ✅ Προσθέτουμε το RootState από το store σου

type ApiProduct = {
  id: string;
  name: string;
  price: string | number;
  stock_status?: string;
  slug?: string;
};

import type { CartItem } from "@/store/cartSlice";

function isEnabled(status?: string) {
  const s = (status || "").toLowerCase();
  return !(s === "ask_for_price" || s === "currently_unavailable");
}

export default function AddToCartButton({ product }: { product: ApiProduct }) {
  const dispatch = useDispatch();
  const items: CartItem[] = useSelector(
    (state: RootState) => state.cart?.items ?? []
  ); // ✅ Χρησιμοποιούμε RootState αντί για any

  const storeQty = items.find((it) => it.productId === product.id)?.qty ?? 0;

  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const enabled = isEnabled(product.stock_status);
  const priceNum = Number.parseFloat(String(product.price));

  const parseJsonSafe = async (res: Response): Promise<any> => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      console.error("Non-JSON response:", text);
      throw new Error(`HTTP ${res.status} (non-JSON)`);
    }
  };

  const postDelta = async (delta: number): Promise<{ items: CartItem[] }> => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        qty: delta,
        price: Number.isFinite(priceNum) ? priceNum : undefined,
      }),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      console.error("POST /api/cart/items failed:", data);
      throw new Error(data?.error || res.statusText);
    }
    return data;
  };

  const deleteItem = async (): Promise<{ items: CartItem[] }> => {
    const res = await fetch("/api/cart/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) {
      console.error("DELETE /api/cart/items failed:", data);
      throw new Error(data?.error || res.statusText);
    }
    return data;
  };

  const run = async (fn: () => Promise<{ items: CartItem[] }>) => {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    try {
      const data = await fn();
      dispatch(setCart(data.items || []));
    } catch (e) {
      console.error("[cart] sync error", e);
    } finally {
      setLoading(false);
      lock.current = false;
    }
  };

  const handleAdd = () => {
    if (!enabled || loading) return;
    run(() => postDelta(+1));
  };

  const handlePlus = () => {
    if (loading) return;
    run(() => postDelta(+1));
  };

  const handleMinus = () => {
    if (loading) return;
    if (storeQty > 1) {
      run(() => postDelta(-1));
    } else {
      run(() => deleteItem());
    }
  };

  const btn =
    "px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400";
  const orange =
    "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed";

  const detailsLabel = "Details";

  return (
    <div className="flex items-center gap-2 min-h-[40px]">
      <AnimatePresence mode="wait" initial={false}>
        {storeQty === 0 ? (
          enabled ? (
            <motion.button
              key="add"
              onClick={handleAdd}
              disabled={loading}
              className={`${btn} ${orange}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Add to cart"
            >
              {loading
                ? "Adding..."
                : product.stock_status?.toLowerCase() === "preorder"
                ? "Preorder"
                : "Add to Cart"}
            </motion.button>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Link
                href={`/products/${product.slug || product.id}`}
                className={`${btn} bg-gray-800 text-white hover:bg-gray-900`}
              >
                {detailsLabel}
              </Link>
            </motion.div>
          )
        ) : (
          <motion.div
            key="qty"
            className="inline-flex items-center rounded-lg border border-orange-500 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <motion.button
              onClick={handleMinus}
              disabled={loading}
              className={`${btn.replace(
                "px-4",
                "px-3"
              )} bg-orange-500 text-white hover:bg-orange-600`}
              whileTap={{ scale: 0.95 }}
              aria-label="Decrease quantity"
            >
              −
            </motion.button>
            <span className="px-4 py-2 text-sm font-medium text-gray-800 bg-white min-w-[2.25rem] text-center">
              {storeQty}
            </span>
            <motion.button
              onClick={handlePlus}
              disabled={loading}
              className={`${btn.replace(
                "px-4",
                "px-3"
              )} bg-orange-500 text-white hover:bg-orange-600`}
              whileTap={{ scale: 0.95 }}
              aria-label="Increase quantity"
            >
              +
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
