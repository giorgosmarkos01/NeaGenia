"use client";

import { useDispatch } from "react-redux";
import { setCart, addItem } from "@/store/cartSlice";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id, // ΠΡΟΣΟΧΗ: πρέπει να είναι το UUID του item
          qty: 1,
          price: product.price,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data.items || [])); // συγχρονίζει από DB
      } else {
        // fallback: optimistic update
        dispatch(
          addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
          })
        );
      }
    } catch (e) {
      // fallback σε error
      dispatch(
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        })
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-100 transition disabled:opacity-60"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
