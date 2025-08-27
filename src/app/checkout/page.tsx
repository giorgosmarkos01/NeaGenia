"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectSubtotal,
  selectCount,
  clearCart,
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
  const dispatch = useDispatch();

  const [docType, setDocType] = useState<DocType>("receipt");
  const [agree, setAgree] = useState(false);
  const [shipping, setShipping] = useState<"elta">("elta");

  // Controlled πεδία
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zip, setZip] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // prices already include VAT
  const shippingFee = shipping === "elta" ? 4.35 : 0;
  const grandTotal = useMemo(
    () => Number((subtotal + shippingFee).toFixed(2)),
    [subtotal, shippingFee]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!agree || items.length === 0) {
      setError("Please agree to terms and add items.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          customer_name: customerName,
          email,
          phone_number: phone,
          address,
          city,
          province,
          zip,
          shipping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      setSuccess(`Order created! Code: ${data.orderCode}`);
      dispatch(clearCart());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              ← Go to products
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* LEFT: Delivery */}
            <div className="md:col-span-2 space-y-6">
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Delivery</h2>

                {/* Receipt / Invoice switch */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Please Select Receipt or Invoice
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="docType"
                        value="receipt"
                        checked={docType === "receipt"}
                        onChange={() => setDocType("receipt")}
                        className="h-4 w-4 text-orange-600"
                      />
                      <span>Receipt</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="docType"
                        value="invoice"
                        checked={docType === "invoice"}
                        onChange={() => setDocType("invoice")}
                        className="h-4 w-4 text-orange-600"
                      />
                      <span>Invoice</span>
                    </label>
                  </div>
                </div>

                {/* Delivery form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Address*
                    </label>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Province
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    >
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
                      ZIP*
                    </label>
                    <input
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </section>
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
                  <span>Subtotal:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shippingFee.toFixed(2)}€</span>
                </div>
              </div>

              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span>{grandTotal.toFixed(2)}€</span>
              </div>

              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
              {success && (
                <p className="text-green-600 text-sm mb-2">{success}</p>
              )}

              <label className="flex items-start gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Use
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={!agree || items.length === 0 || loading}
                className="w-full rounded-md bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Processing..." : "Order Now"}
              </button>
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
