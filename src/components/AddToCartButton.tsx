"use client";

import { useDispatch, useSelector } from "react-redux";
import { setCart, decrementItem, removeItem } from "@/store/cartSlice";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type ApiProduct = {
  id: string;
  name: string;
  price: string | number;
  stock_status?: string;
  slug?: string;
};

type CartItem = { productId: string; qty: number };

function isEnabled(status?: string) {
  const s = (status || "").toLowerCase();
  return !(s === "ask_for_price" || s === "currently_unavailable");
}

export default function AddToCartButton({ product }: { product: ApiProduct }) {
  const dispatch = useDispatch();
  const items: CartItem[] = useSelector((s: any) => s.cart?.items ?? []);
  const storeQty = items.find((it) => it.productId === product.id)?.qty ?? 0;

  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const enabled = isEnabled(product.stock_status);

  // ---- API helpers (DELTA semantics) ----
  const postDelta = async (delta: number) => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        qty: delta, // <-- delta (+1 / -1). Change to "delta" if your API uses that key.
        price: Number(product.price),
      }),
    });
    if (!res.ok) throw new Error("POST delta failed");
    return res.json();
  };

  const deleteItem = async () => {
    const res = await fetch("/api/cart/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    if (!res.ok) throw new Error("DELETE failed");
    return res.json();
  };

  const run = async (fn: () => Promise<any>) => {
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

  // ---- Handlers ----
  const handleAdd = () => {
    if (!enabled || loading) return;
    run(() => postDelta(+1));
  };

  const handlePlus = () => {
    if (loading) return;
    run(() => postDelta(+1)); // server increments, then setCart syncs
  };

  const handleMinus = () => {
    if (loading) return;

    if (storeQty > 1) {
      // Just decrement locally
      dispatch(decrementItem(product.id));
      // (optional: sync server in background with -1 POST if your API supports it)
    } else {
      // Last piece → remove from backend
      run(() => deleteItem());
    }
  };

  // ---- Styles ----
  const btn =
    "px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400";
  const orange =
    "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed";
  const muted = "bg-gray-200 text-gray-500 cursor-not-allowed";

  const disabledLabel =
    product.stock_status?.toLowerCase() === "ask_for_price"
      ? "Ask for Price"
      : "Unavailable";

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
            >
              {loading
                ? "Adding..."
                : product.stock_status?.toLowerCase() === "preorder"
                ? "Preorder"
                : "Add to Cart"}
            </motion.button>
          ) : (
            <motion.div
              key="disabled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <button disabled className={`${btn} ${muted}`}>
                {disabledLabel}
              </button>
              {product.stock_status?.toLowerCase() === "ask_for_price" && (
                <Link
                  href={`/contact?subject=${encodeURIComponent(
                    `Price request: ${product.name}`
                  )}`}
                  className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Contact
                </Link>
              )}
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
