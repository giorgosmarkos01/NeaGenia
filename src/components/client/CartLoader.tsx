"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCart } from "@/store/cartSlice";

export default function CartLoader() {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cart/items", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data.items || []));
      }
    })();
  }, [dispatch]);
  return null;
}
