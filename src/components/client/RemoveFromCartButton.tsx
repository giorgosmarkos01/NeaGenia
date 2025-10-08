"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";

import { setItemAbs, selectCartStatus, type CartItem } from "@/store/cartSlice";
import type { AppDispatch } from "@/store/store";

export default function RemoveFromCartButton({
  productId,
  onSync, // optional legacy callback; we'll still call it with server items
  className = "",
}: {
  productId: string;
  onSync?: (items: CartItem[]) => void;
  className?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const globalStatus = useSelector(selectCartStatus);
  const [loading, setLoading] = useState(false);

  const busy = loading || globalStatus === "loading";

  const handleRemove = async () => {
    if (busy) return;
    setLoading(true);
    try {
      // Non-optimistic: server snapshot replaces Redux state
      const { items } = await dispatch(setItemAbs({ productId, qty: 0 })).unwrap();
      // Back-compat: still fire onSync with the authoritative server items
      onSync?.(items || []);
    } catch {
      // no local fallback — server is the source of truth
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={busy}
      title="Remove from cart"
      className={`p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center ${className}`}
    >
      {busy ? (
        <svg
          className="animate-spin h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        <Trash2 className="w-5 h-5" />
      )}
    </button>
  );
}
