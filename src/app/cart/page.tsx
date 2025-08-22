"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RemoveFromCartButton from "@/components/RemoveFromCartButton";
import { useDispatch } from "react-redux";
import { setCart, decrementItem } from "@/store/cartSlice";

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

interface UiCartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
}
interface ApiCartItem {
  productId: string;
  name: string;
  price: string | number;
  qty: number;
  imageUrl?: string;
}
interface CartApiResponse {
  cartId: string | null;
  items: ApiCartItem[];
}

export default function CartPage() {
  const [items, setItems] = useState<UiCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const lock = useRef(false);
  const dispatch = useDispatch();

  const toMoney = (v: unknown) => Number.parseFloat(String(v ?? 0)) || 0;

  function applyItems(rawItems: ApiCartItem[]) {
    // UI items (κρατάνε και imageUrl)
    const uiItems: UiCartItem[] = rawItems.map((it) => ({
      productId: it.productId,
      name: it.name,
      price: toMoney(it.price),
      qty: it.qty,
      imageUrl: it.imageUrl
        ? it.imageUrl.startsWith("/")
          ? baseUrl + it.imageUrl
          : it.imageUrl
        : fallbackImage,
    }));
    setItems(uiItems);
    setTotal(uiItems.reduce((sum, i) => sum + i.price * i.qty, 0));

    // Redux items (μόνο αυτά που ζητάει το slice)
    const reduxItems = rawItems.map((it) => ({
      productId: it.productId,
      name: it.name,
      price: toMoney(it.price),
      qty: it.qty,
    }));
    dispatch(setCart(reduxItems));
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cart/items", { cache: "no-store" });
      if (!res.ok) return;
      const data: CartApiResponse = await res.json();
      applyItems(data.items);
    })();
  }, []);

  // ---------- API helpers ----------
  const postDelta = async (productId: string, delta: number, price: number) => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        qty: delta,
        price: Number(price),
      }),
    });
    if (!res.ok) throw new Error("POST delta failed");
    return (await res.json()) as CartApiResponse;
  };

  const deleteItem = async (productId: string) => {
    const res = await fetch("/api/cart/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("DELETE failed");
    return (await res.json()) as CartApiResponse;
  };

  const run = async (productId: string, fn: () => Promise<CartApiResponse>) => {
    if (lock.current) return;
    lock.current = true;
    setLoadingId(productId);
    try {
      const data = await fn();
      applyItems(data.items || []);
    } catch (e) {
      console.error("[cart] sync error", e);
    } finally {
      setLoadingId(null);
      lock.current = false;
    }
  };

  // ---------- Handlers ----------
  const handlePlus = (it: UiCartItem) => {
    run(it.productId, () => postDelta(it.productId, +1, it.price));
  };

  const handleMinus = (it: UiCartItem) => {
    if (loadingId) return;
    if (it.qty > 1) {
      // Optimistic local update
      setItems((prev) =>
        prev.map((row) =>
          row.productId === it.productId ? { ...row, qty: row.qty - 1 } : row
        )
      );
      setTotal((prev) => Math.round((prev - it.price) * 100) / 100);
      dispatch(decrementItem(it.productId));
      // optional: background sync με -1
      // postDelta(it.productId, -1, it.price).catch(console.error);
    } else {
      run(it.productId, () => deleteItem(it.productId));
    }
  };

  const shippingFee = 0;
  const tax = Math.round(total * 0.24 * 100) / 100;
  const grandTotal = Math.round((total + shippingFee + tax) * 100) / 100;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Your <span className="text-orange-500">Cart</span>
        </h1>

        {items.length === 0 ? (
          <p className="text-black">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="md:col-span-2">
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
                  {items.map((it) => {
                    const rowLoading = loadingId === it.productId;
                    return (
                      <tr key={it.productId} className="border-b">
                        <td className="py-4 flex items-center space-x-4">
                          <img
                            src={it.imageUrl || fallbackImage}
                            alt={it.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="text-black">{it.name}</p>
                          </div>
                        </td>
                        <td>€ {it.price.toFixed(2)}</td>
                        <td>
                          <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                              onClick={() => handleMinus(it)}
                              disabled={it.qty === 1 || rowLoading}
                              className="px-3 py-1 text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 text-sm text-gray-800 bg-white text-center min-w-[2.25rem]">
                              {it.qty}
                            </span>
                            <button
                              onClick={() => handlePlus(it)}
                              disabled={rowLoading}
                              className="px-3 py-1 text-sm text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>€ {(it.price * it.qty).toFixed(2)}</td>
                        <td>
                          <RemoveFromCartButton
                            productId={it.productId}
                            onSync={(newItems) => applyItems(newItems)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <Link
                href="/products"
                className="mt-4 inline-block text-orange-500 hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Right: Order Summary */}
            <div className="border p-4 rounded-lg shadow-sm text-black">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Items ({items.length})</span>
                <span>€ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? "Free" : `€ ${shippingFee}`}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Tax (24%)</span>
                <span>€ {tax.toFixed(2)}</span>
              </div>
              <hr className="mb-4" />
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>€ {grandTotal.toFixed(2)}</span>
              </div>
              <button className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
