"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  qty: number;
  productName: string;
  autoCloseMs?: number;
};

export default function CartModal({
  open,
  onClose,
  qty,
  productName,
  autoCloseMs = 1500,
}: Props) {
  // auto-dismiss
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onClose]);

  // close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // overlay click closes
          aria-modal="true"
          role="dialog"
          aria-labelledby="added-title"
        >
          <motion.div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 id="added-title" className="text-base font-semibold text-black">
                Product Added Successfully
              </h3>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Added <span className="font-medium text-black">{qty}</span> ×{" "}
              <span className="font-medium text-black">{productName}</span> to your cart.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                onClick={onClose}
              >
                Continue Shopping
              </button>
              <a
                href="/cart"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900"
              >
                View Cart
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
