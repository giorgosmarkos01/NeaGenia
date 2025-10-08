"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import CartQuantity from "@/components/client/CartQuantity";
import Image from "next/image";
import RemoveFromCartButton from "@/components/client/RemoveFromCartButton";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  setItemAbs,
  selectCartItems,
  selectSubtotal,   // original (pre-discount) subtotal from Redux/server
  selectCartStatus,
} from "@/store/cartSlice";
import type { AppDispatch } from "@/store/store";

import type { Discount } from "@/types/discount";
import { pickDiscountsForProduct } from "@/utils/discounts";

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticstore.com";

/** Fetch discounts applicable to a given itemId (should include item + category discounts for that item) */
async function fetchDiscountsForItem(itemId: string): Promise<Discount[]> {
  const res = await fetch(`/api/discounts/by-item?itemId=${encodeURIComponent(itemId)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({ discounts: [] }));
  const rows = Array.isArray(data?.discounts) ? data.discounts : [];
  // normalize to Discount[]
  return rows.map((d: any) => ({
    id: Number(d.id),
    name: String(d.name),
    type: d.type ?? d.discount_type,
    value: Number(d.value),
    startsAt: d.startsAt ?? d.starts_at ?? null,
    endsAt: d.endsAt ?? d.ends_at ?? null,
    stackable: Boolean(d.stackable),
    couponCode: d.couponCode ?? d.coupon_code ?? null,
    scope: (d.scope as "item" | "category") ?? "item",
    appliesTo:
      d.scope === "category" && d.categoryId
        ? { categoryId: Number(d.categoryId) }
        : { itemId },
  }));
}

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Authoritative cart items from Redux (server-driven)
  const cartItems = useSelector(selectCartItems);
  const originalSubtotal = useSelector(selectSubtotal); // not shown now, but kept if you need it
  const status = useSelector(selectCartStatus);
  const busy = status === "loading";

  // Images cache (if items omit imageUrl in Redux)
  const [imageById, setImageById] = useState<Record<string, string>>({});
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Discounts map per productId
  const [discountsMap, setDiscountsMap] = useState<Record<string, Discount[]>>({});

  const upsertImages = useCallback((rows: Array<{ productId: string; imageUrl?: string | null }>) => {
    setImageById((prev) => {
      const next = { ...prev };
      for (const r of rows) {
        const raw = r.imageUrl || fallbackImage;
        next[r.productId] = raw.startsWith("/") ? baseUrl + raw : raw;
      }
      return next;
    });
  }, []);

  // Keep image cache synced when items change
  useEffect(() => {
    if (cartItems?.length) {
      upsertImages(cartItems as unknown as Array<{ productId: string; imageUrl?: string | null }>);
    }
  }, [cartItems, upsertImages]);

  // Initial cart snapshot from server
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Fetch discounts per itemId (assumes endpoint returns all applicable discounts for that item)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const ids = Array.from(new Set(cartItems.map(i => i.productId)));
      if (ids.length === 0) {
        if (!cancelled) setDiscountsMap({});
        return;
      }

      // Explicitly type the tuple so arr is Discount[]
      const results: Array<[string, Discount[]]> = await Promise.all(
        ids.map(async (id): Promise<[string, Discount[]]> => {
          try {
            const d = await fetchDiscountsForItem(id);
            return [id, d];
          } catch {
            return [id, [] as Discount[]]; // cast empty array to mutable Discount[]
          }
        })
      );

      if (!cancelled) {
        const map: Record<string, Discount[]> = {};
        for (const [id, arr] of results) map[id] = arr; // arr is Discount[] now
        setDiscountsMap(map);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [cartItems]);

  // Compute discounted lines
  const lines = useMemo(() => {
    return cartItems.map((it) => {
      const unit = Number(it.price) || 0;
      const discounts = discountsMap[it.productId] ?? [];
      const { finalPrice, applicable } = pickDiscountsForProduct(
        {
          id: it.productId,
          price: unit,
        },
        discounts
      );
      const discounted = applicable.length > 0 && finalPrice < unit;
      return {
        ...it,
        unitPrice: unit,
        finalUnitPrice: discounted ? finalPrice : unit, // replace old with new
        discounted,
        lineFinalTotal: (discounted ? finalPrice : unit) * it.qty,
      };
    });
  }, [cartItems, discountsMap]);

  const discountedSubtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineFinalTotal, 0),
    [lines]
  );

  const grandTotal = useMemo(() => discountedSubtotal, [discountedSubtotal]);

  const removeLine = (productId: string) => {
    // Non-optimistic removal
    dispatch(setItemAbs({ productId, qty: 0 }));
  };

  // Observe checkout box (for floating button)
  useEffect(() => {
    const checkoutEl = document.getElementById("checkout");
    if (!checkoutEl) return;

    const observer = new IntersectionObserver(
      (entries) => setCheckoutVisible(entries[0].isIntersecting),
      { threshold: 0.2 }
    );

    observer.observe(checkoutEl);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Your <span className="text-blue-500">Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <p className="text-black">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="md:col-span-2">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-left border-collapse text-black">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2">Product Details</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Subtotal</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((it) => (
                      <tr key={it.productId} className="border-b">
                        <td className="py-4 flex items-center space-x-4">
                          <Image
                            src={imageById[it.productId] || fallbackImage}
                            alt={it.name}
                            width={64}
                            height={64}
                            className="object-cover rounded"
                          />
                          <div>
                            <p className="text-black">{it.name}</p>
                          </div>
                        </td>

                        {/* Unit Price cell: red if discounted, otherwise normal */}
                        <td className="py-4">
                          <span className={it.discounted ? "text-red-600 font-semibold" : ""}>
                            € {it.finalUnitPrice.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-4">
                          <CartQuantity
                            productId={it.productId}
                            qty={it.qty}
                            min={1}
                            price={Number(it.finalUnitPrice)} // pass the current unit price
                          />
                        </td>

                        {/* Line Subtotal cell: red if discounted */}
                        <td className="py-4">
                          <span className={it.discounted ? "text-red-600 font-semibold" : ""}>
                            € {it.lineFinalTotal.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-4">
                          <RemoveFromCartButton productId={it.productId} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 md:hidden">
                {lines.map((it) => (
                  <div
                    key={it.productId}
                    className="border rounded-lg p-4 flex items-start gap-4"
                  >
                    <Image
                      src={imageById[it.productId] || fallbackImage}
                      alt={it.name}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-black mb-1">{it.name}</p>

                      {/* Unit price */}
                      <div className="mb-2">
                        <span className={it.discounted ? "text-red-600 font-semibold" : "text-sm text-gray-600"}>
                          Price: € {it.finalUnitPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <CartQuantity
                          productId={it.productId}
                          qty={it.qty}
                          min={1}
                          price={Number(it.finalUnitPrice)}
                        />
                        <span className={`font-semibold ${it.discounted ? "text-red-600" : "text-black"}`}>
                          € {it.lineFinalTotal.toFixed(2)}
                        </span>
                        <RemoveFromCartButton productId={it.productId} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-4 inline-block text-blue-500 hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Right: Order Summary */}
            <div id="checkout" className="border p-4 rounded-lg shadow-sm text-black">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Items ({cartItems.length})</span>
                <span>€ {discountedSubtotal.toFixed(2)}</span>
              </div>
              <hr className="mb-4" />
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>€ {grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-center">
                <Link
                  href="/checkout"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Floating Checkout Button for Mobile */}
      {!checkoutVisible && cartItems.length > 0 && (
        <button
          onClick={() => {
            const el = document.getElementById("checkout");
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top: y - 60, behavior: "smooth" });
            }
          }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition md:hidden"
        >
          ↓
        </button>
      )}
    </>
  );
}
