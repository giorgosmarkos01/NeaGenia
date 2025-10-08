"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDelta, selectCartStatus } from "@/store/cartSlice";
import type { AppDispatch } from "@/store/store";

type Props = {
  productId: string;                // needed for server writes
  qty: number;
  min?: number;                     // default 1
  price?: number;                   // optional; server can verify/ignore
  variantIds?: number[];            // optional; passthrough if your API supports it
  className?: string;
};

export default function CartQuantity({
  productId,
  qty,
  min = 1,
  price,
  variantIds,
  className = "",
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectCartStatus);
  const busy = status === "loading";

  const disableMinus = qty <= min || busy;

  const onMinus = () =>
    dispatch(addDelta({ productId, delta: -1, price, variantIds }));
  const onPlus = () =>
    dispatch(addDelta({ productId, delta: +1, price, variantIds }));

  return (
    <div
      className={`inline-flex items-center border border-gray-300 rounded-md overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={onMinus}
        disabled={disableMinus}
        className="px-3 py-1 text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
        aria-label="Decrease quantity"
      >
        −
      </button>

      {/* Read-only quantity display (server is source of truth) */}
      <span
        className="px-4 py-1 text-sm text-gray-800 bg-white min-w-[2.25rem] text-center select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </span>

      <button
        type="button"
        onClick={onPlus}
        disabled={busy}
        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
