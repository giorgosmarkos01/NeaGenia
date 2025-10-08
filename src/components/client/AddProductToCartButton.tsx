"use client";

import { useDispatch, useSelector } from "react-redux";
import { setItemAbs, selectCartStatus } from "@/store/cartSlice";
import type { AppDispatch } from "@/store/store";
import { useState } from "react";
import { motion } from "framer-motion";
import CartModal from "@/components/client/CartModal";

type MinimalProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  stockStatus: string;
  coverImage: string;
};

function isEnabled(status?: string) {
  const s = (status || "").toLowerCase();
  return !(s === "ask_for_price" || s === "currently_unavailable");
}

export default function AddProductToCartButton({
  product,
  min = 1,
  max,
  className = "",
  variantIds,
}: {
  product: MinimalProduct;
  min?: number;
  max?: number;
  className?: string;
  variantIds?: number[];
}) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectCartStatus);
  const busy = status === "loading";

  const enabled = isEnabled(product.stockStatus);
  const priceNum = Number.parseFloat(String(product.price));

  const [qty, setQty] = useState<number>(Math.max(min, 1));
  const [showOk, setShowOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inc = () =>
    setQty((q) => (typeof max === "number" ? Math.min(q + 1, max) : q + 1));
  const dec = () => setQty((q) => Math.max(min, q - 1));
  const onQtyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value.replace(/[^\d]/g, "")) || min;
    if (typeof max === "number") setQty(Math.max(min, Math.min(v, max)));
    else setQty(Math.max(min, v));
  };

  const handleAdd = async () => {
    if (!enabled || busy) return;
    setErrorMsg(null);
    try {
      await dispatch(
        setItemAbs({
          productId: product.id,
          qty,
          price: Number.isFinite(priceNum) ? priceNum : undefined,
          variantIds,
        })
      ).unwrap();
      setShowOk(true);
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong");
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Qty picker */}
      <div className="inline-flex items-center rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={dec}
          disabled={busy || qty <= min}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={qty}
          onChange={onQtyInput}
          className="w-14 text-center outline-none py-2 text-sm"
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={inc}
          disabled={busy || (typeof max === "number" && qty >= max)}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Add button */}
      <motion.button
        onClick={handleAdd}
        disabled={busy || !enabled}
        className={`
          add-button flex items-center justify-center gap-2 px-5 py-2 
          text-sm sm:text-base font-semibold rounded-lg text-white
          bg-monkey hover:bg-monkey/80 
          disabled:bg-monkey disabled:cursor-not-allowed
        `}
        whileTap={{ scale: 0.98 }}
        aria-label="Add selected quantity to cart"
      >
        {busy ? "Adding..." : "Add to Cart"}
      </motion.button>

      {errorMsg && (
        <span className="text-sm text-rose-600" role="alert">
          {errorMsg}
        </span>
      )}

      {/* Reusable modal (auto closes in 3s) */}
      <CartModal
        open={showOk}
        onClose={() => setShowOk(false)}
        qty={qty}
        productName={product.name}
        autoCloseMs={3000} // optional
      />
    </div>
  );
}
