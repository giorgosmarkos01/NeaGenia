/* 
 *  ADD TO CART BUTTON ONLY FOR PRODUCT CARDS, NOT PRODUCT PAGE "product/:slug"
*/

"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDelta, selectQtyById } from "@/store/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { ProductSummary } from "@/types/product";
import type { AppDispatch } from "@/store/store";
import CartModal from "@/components/client/CartModal";

function isEnabled(status?: string) {
  const s = (status || "").toLowerCase();

  return !(s === "ask_for_price" || s === "currently_unavailable");
}

export default function AddToCartButton({ product }: { product: ProductSummary }) {
  const dispatch = useDispatch<AppDispatch>();
  const storeQty = useSelector(selectQtyById(product.id));
  const [loading, setLoading] = useState(false); // per-button loading
  const [showOk, setShowOk] = useState(false);   // modal state

  const enabled = isEnabled(product.stockStatus);
  const priceNum = Number(product.price) || 0;

  const handleAdd = async () => {
    if (!enabled || loading) return;
    setLoading(true);
    try {
      await dispatch(
        addDelta({ productId: product.id, delta: +1, price: priceNum })
      ).unwrap();
      // Show success modal after adding 1 item
      setShowOk(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePlus = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await dispatch(
        addDelta({ productId: product.id, delta: +1, price: priceNum })
      ).unwrap();
      // No modal on +/- to avoid repeated popups
    } finally {
      setLoading(false);
    }
  };

  const handleMinus = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await dispatch(
        addDelta({ productId: product.id, delta: -1, price: priceNum })
      ).unwrap();
    } finally {
      setLoading(false);
    }
  };

  const detailsLabel = "Details";

  return (
    <>
      <div className="flex items-center gap-2 min-h-[40px]">
        <AnimatePresence mode="wait" initial={false}>
          {storeQty === 0 ? (
            enabled ? (
              <motion.button
                key="add"
                onClick={handleAdd}
                disabled={loading}
                className={`
                  flex items-center justify-center gap-2 
                  px-4 py-2 sm:px-5 sm:py-2 
                  text-sm sm:text-base font-semibold rounded-lg 
                  bg-[#F75807] text-white hover:bg-[#D24B06]
                  cursor-pointer disabled:opacity-100 disabled:cursor-not-allowed
                `}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Add to cart"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" aria-hidden="true">
                  <path
                    d="M3 4h2l2 12a2 2 0 002 2h8a2 2 0 002-2l1-8H6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="20" r="1" fill="currentColor" />
                  <circle cx="18" cy="20" r="1" fill="currentColor" />
                </svg>
                <span className="hidden sm:inline">
                  {loading ? "Adding..." : "Add to Cart"}
                </span>
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
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#F75807] text-white hover:bg-[#D24B06]"
                >
                  {detailsLabel}
                </Link>
              </motion.div>
            )
          ) : (
            <motion.div
              key="qty"
              className="add-button inline-flex items-center rounded-lg border overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
            >
              <motion.button
                onClick={handleMinus}
                disabled={loading}
                className="px-3 py-2 text-sm font-medium bg-[#F75807] text-white hover:bg-[#D24B06] cursor-pointer disabled:opacity-100 disabled:cursor-not-allowed"
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
                className="px-3 py-2 text-sm font-medium bg-[#F75807] text-white hover:bg-[#D24B06] cursor-pointer disabled:opacity-100 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                aria-label="Increase quantity"
              >
                +
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reusable modal (auto closes in 3s) */}
      <CartModal
        open={showOk}
        onClose={() => setShowOk(false)}
        qty={1} // we added +1 on this component's "Add to Cart" click
        productName={product.name}
        autoCloseMs={3000}
      />
    </>
  );
}
