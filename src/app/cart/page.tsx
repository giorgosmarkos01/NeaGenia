"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CartQuantity from "@/components/client/CartQuantity";
import Image from "next/image";
import RemoveFromCartButton from "@/components/client/RemoveFromCartButton";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, setItemAbs, selectCartItems, selectCartStatus } from "@/store/cartSlice";
import type { AppDispatch } from "@/store/store";

const fallbackImage = "/logo.png";

// Cart item shape compatible with ProductSummary image fields
type CartLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  effectivePrice?: number;
  effectiveLineTotal?: number;
  discounted?: boolean;
  // prefer coverImage like ProductSummary; keep imageUrl for backward-compat
  coverImage?: string | null;
  imageUrl?: string | null;
  slug?: string;
};

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector(selectCartItems) as CartLine[];
  const status = useSelector(selectCartStatus);
  const busy = status === "loading";

  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Initial cart snapshot from server (already discount-aware)
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Discount-aware lines (effectivePrice/discounted come straight from the API)
  const lines = useMemo(() => {
    return cartItems.map((it) => {
      const unit = Number(it.price) || 0;
      const finalUnitPrice = Number(it.effectivePrice ?? unit);
      const discounted = !!it.discounted && finalUnitPrice < unit;
      return {
        ...it,
        unitPrice: unit,
        finalUnitPrice,
        discounted,
        lineFinalTotal: Number(it.effectiveLineTotal ?? finalUnitPrice * it.qty),
      };
    });
  }, [cartItems]);

  const discountedSubtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineFinalTotal, 0),
    [lines]
  );

  const grandTotal = useMemo(() => discountedSubtotal, [discountedSubtotal]);

  const removeLine = (productId: string) => {
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

  // Helper to pick image source like ProductCard (prefer coverImage)
  const getImageSrc = (it: CartLine) => it.coverImage || it.imageUrl || fallbackImage;

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
                            src={getImageSrc(it)}
                            alt={it.name}
                            width={64}
                            height={64}
                            className="object-contain rounded"
                            sizes="64px"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement & { src: string };
                              if (img.src !== fallbackImage) img.src = fallbackImage;
                            }}
                          />
                          <div>
                            <p className="text-black">{it.name}</p>
                          </div>
                        </td>

                        {/* Unit Price cell */}
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
                            price={Number(it.finalUnitPrice)}
                          />
                        </td>

                        {/* Line Subtotal cell */}
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
                  <div key={it.productId} className="border rounded-lg p-4 flex items-start gap-4">
                    <Image
                      src={getImageSrc(it)}
                      alt={it.name}
                      width={80}
                      height={80}
                      className="object-contain rounded"
                      sizes="80px"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement & { src: string };
                        if (img.src !== fallbackImage) img.src = fallbackImage;
                      }}
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

              <Link href="/products" className="mt-4 inline-block text-blue-500 hover:underline">
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
                  className="px-8 py-3 bg-[#F75807] text-white rounded-lg text-lg hover:bg-[#D24B06] transition"
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
