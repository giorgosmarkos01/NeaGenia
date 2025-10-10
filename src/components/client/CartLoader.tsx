"use client";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCart } from "@/store/cartSlice";

export default function CartLoader() {
  const dispatch = useDispatch();
  const hasLoaded = useRef(false); // <-- guard flag

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    console.log("[CartLoader] Fetching cart…");

    (async () => {
      const res = await fetch("/api/cart/items", { cache: "no-store" });
      const data = await res.json();
      dispatch(setCart(data.items || []));
    })();
  }, [dispatch]);

  return null;
}
