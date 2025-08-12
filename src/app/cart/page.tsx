"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
}

interface CartApiResponse {
  cartId: string | null;
  items: {
    productId: string;
    name: string;
    price: number | string;
    qty: number;
    imageUrl?: string;
  }[];
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const toMoney = (v: unknown) => Number.parseFloat(String(v ?? 0)) || 0;

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;

        const data: CartApiResponse = await res.json();

        const fixedItems: CartItem[] = data.items.map((it) => ({
          ...it,
          price: toMoney(it.price),
          imageUrl: it.imageUrl
            ? it.imageUrl.startsWith("/")
              ? baseUrl + it.imageUrl
              : it.imageUrl
            : fallbackImage,
        }));

        setItems(fixedItems);

        const sumTotal = fixedItems.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.qty,
          0
        );
        setTotal(sumTotal);
      } catch (err) {
        console.error("Error loading cart", err);
      }
    }
    fetchCart();
  }, []);

  const shippingFee = 0;
  const tax = Math.round(total * 0.02 * 100) / 100;
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
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-4 flex items-center space-x-4">
                        <img
                          src={it.imageUrl || fallbackImage}
                          alt={it.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="text-black">{it.name}</p>
                          <button className="text-sm text-orange-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      </td>
                      <td>€ {it.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          value={it.qty}
                          min={1}
                          className="w-16 border rounded text-center"
                        />
                      </td>
                      <td>€ {(it.price * it.qty).toFixed(2)}</td>
                    </tr>
                  ))}
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
                <span>Tax (2%)</span>
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
