"use client";

import { useDispatch } from "react-redux";
import { setCart, addItem } from "@/store/cartSlice";
import { useState } from "react";
import Link from "next/link";

type ApiProduct = {
  id: string;
  name: string;
  price: string | number;
  stock_status?: string;
  slug?: string;
};

function statusMeta(status?: string) {
  const s = (status || "").toLowerCase();

  // Decide label, enabled, and style
  if (s === "available_immediately") {
    return { label: "Add to Cart", enabled: true, tone: "primary" as const };
  }
  if (s === "available_after_ordering") {
    return { label: "Add to Cart", enabled: true, tone: "primary" as const };
  }
  if (s === "preorder") {
    return { label: "Preorder", enabled: true, tone: "primary" as const };
  }
  if (s === "ask_for_price") {
    return { label: "Ask for price", enabled: false, tone: "muted" as const };
  }
  if (s === "currently_unavailable") {
    return { label: "Unavailable", enabled: false, tone: "muted" as const };
  }
  return { label: "Add to Cart", enabled: true, tone: "primary" as const };
}

export default function AddToCartButton({ product }: { product: ApiProduct }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const meta = statusMeta(product.stock_status);

  const handleAdd = async () => {
    if (!meta.enabled || loading) return;

    try {
      setLoading(true);
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id, // must be the UUID of the item
          qty: 1,
          price: Number(product.price),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data.items || [])); // sync from DB
      } else {
        // optimistic fallback
        dispatch(
          addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            qty: 1,
          })
        );
      }
    } catch (e) {
      // error fallback
      dispatch(
        addItem({
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          qty: 1,
        })
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // styles
  const base =
    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm transition";
  const primary =
    "bg-zinc-900 text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50";
  const muted =
    "bg-white text-zinc-500 border border-zinc-300 cursor-not-allowed";

  const className = `${base} ${meta.tone === "primary" ? primary : muted}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAdd}
        disabled={loading || !meta.enabled}
        className={`${className} ${
          loading || !meta.enabled ? "opacity-70" : ""
        }`}
        title={!meta.enabled ? meta.label : undefined}
        aria-disabled={loading || !meta.enabled}
      >
        {/* Cart icon (hidden when disabled) */}
        {meta.enabled && (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M7 4h-2l-1 2m0 0l2.5 9.5a2 2 0 002 1.5h8a2 2 0 002-1.5L20 8H6m-2-2h16M10 20a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
              fill="currentColor"
            />
          </svg>
        )}
        {loading ? "Adding..." : meta.label}
      </button>

      {/* Optional secondary action for special states */}
      {product.stock_status?.toLowerCase() === "ask_for_price" && (
        <Link
          href={`/contact?subject=${encodeURIComponent(
            `Price request: ${product.name}`
          )}`}
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs sm:text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Contact
        </Link>
      )}
    </div>
  );
}
