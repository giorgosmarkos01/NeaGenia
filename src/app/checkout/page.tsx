// app/checkout/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  selectCartItems,
  selectSubtotal,
  selectCount,
} from "@/store/cartSlice";
import { useMemo, useState } from "react";

type DocType = "receipt" | "invoice";

const greekProvinces = [
  "Attica",
  "Central Macedonia",
  "Western Greece",
  "Thessaly",
  "Crete",
  "Eastern Macedonia and Thrace",
  "Epirus",
  "Ionian Islands",
  "North Aegean",
  "Peloponnese",
  "South Aegean",
  "Western Macedonia",
];

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectSubtotal);
  const count = useSelector(selectCount);

  const [docType, setDocType] = useState<DocType>("receipt");
  const [agree, setAgree] = useState(false);
  const [shipping, setShipping] = useState<"elta">("elta");

  // prices already include VAT (όπως ζήτησες).
  const shippingFee = shipping === "elta" ? 4.35 : 0;
  const grandTotal = useMemo(
    () => Number((subtotal + shippingFee).toFixed(2)),
    [subtotal, shippingFee]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree || items.length === 0) return;
    // TODO: εδώ ξεκινάς το πραγματικό checkout (create order, redirect to payment, κλπ)
    alert("Order submitted! (stub)"); // αντικατάστησέ το με την πραγματική ροή
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 text-black">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-sm text-gray-500">All prices include VAT.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border p-6 bg-white">
            <p className="mb-2">Your cart is empty.</p>
            <Link href="/products" className="text-orange-600 hover:underline">
              Go to products →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* LEFT: Delivery + (optional) Billing */}
            <div className="md:col-span-2 space-y-6">
              {/* Delivery */}
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Delivery</h2>

                {/* Receipt / Invoice switch */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Please Select Receipt or Invoice
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="docType"
                        value="receipt"
                        checked={docType === "receipt"}
                        onChange={() => setDocType("receipt")}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span>Receipt</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="docType"
                        value="invoice"
                        checked={docType === "invoice"}
                        onChange={() => setDocType("invoice")}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span>Invoice</span>
                    </label>
                  </div>
                </div>

                {/* Delivery form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      First and Last Name (for shipping)*
                    </label>
                    <input
                      required
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      defaultValue="Greece"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Address Line
                    </label>
                    <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      City
                    </label>
                    <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Province
                    </label>
                    <select className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Province</option>
                      {greekProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>

                {/* Shipping options */}
                <div className="mt-6">
                  <p className="text-sm text-gray-700 mb-2">Shipping Options</p>
                  <label
                    className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition ${
                      shipping === "elta"
                        ? "border-blue-400 shadow-sm"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      className="h-4 w-4 text-blue-600"
                      checked={shipping === "elta"}
                      onChange={() => setShipping("elta")}
                    />
                    <div className="flex items-center gap-4">
                      {/* replace with real logo if you want */}
                      <div className="h-10 w-10 rounded bg-red-600 text-white grid place-items-center text-xs font-bold">
                        ELTA
                      </div>
                      <div>
                        <div className="font-semibold">ELTA</div>
                        <div className="text-sm text-gray-500">
                          Delivery Cost: 4.35€
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Billing (only if Invoice) */}
              {docType === "invoice" && (
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Billing Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        VAT Number
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        Company Address
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company City
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company ZIP
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Profession/Occupation
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Tax Office
                      </label>
                      <input className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  </div>

                  {/* Shipping options (show again here if θες – κράτησα ένα σετ επάνω για απλότητα) */}
                </section>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            <aside className="rounded-xl border bg-white p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Product Quantity:</span>
                  <span>{count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (included):</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (VAT Included):</span>
                  <span>{shippingFee.toFixed(2)}€</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total Amount:</span>
                <span>{grandTotal.toFixed(2)}€</span>
              </div>

              <label className="flex items-start gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <span>
                  I have read and agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Use
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!agree || items.length === 0}
                className="w-full rounded-md bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Order Now
              </button>
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
