"use client";

import { useDispatch } from "react-redux";
import { setCart, removeItem as removeLocal } from "@/store/cartSlice";
import { useState } from "react";
import { Trash2 } from "lucide-react"; // icon

type ApiItem = {
  productId: string;
  name: string;
  price: number | string;
  qty: number;
  imageUrl?: string;
};

export default function RemoveFromCartButton({
  productId,
  onSync,
}: {
  productId: string;
  onSync?: (items: ApiItem[]) => void;
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data.items || []));
        onSync?.(data.items || []);
      } else {
        dispatch(removeLocal(productId));
      }
    } catch {
      dispatch(removeLocal(productId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      title="Remove from cart"
      className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center"
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        <Trash2 className="w-5 h-5" />
      )}
    </button>
  );
}
