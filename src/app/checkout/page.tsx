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
  const [shipping, setShipping] = useState<"ELTA" | "FedEx" | "BoxNow">("ELTA");
  const [loading, setLoading] = useState(false);

  // --- Delivery fields ---
  const [customer_name, setCustomerName] = useState("");
  const [phone_number, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Greece");

  // --- Invoice fields ---
  const [company_name, setCompanyName] = useState("");
  const [vat_number, setVat] = useState("");
  const [company_address, setCompanyAddress] = useState("");
  const [company_city, setCompanyCity] = useState("");
  const [company_zip, setCompanyZip] = useState("");
  const [occupation, setOccupation] = useState("");
  const [tax_office, setTaxOffice] = useState("");

  // prices already include VAT (όπως είπαμε).
  const shippingFee = shipping === "ELTA" ? 4.35 : 0;
  const grandTotal = useMemo(
    () => Number((subtotal + shippingFee).toFixed(2)),
    [subtotal, shippingFee]
  );

  const buildPayload = () => {
    const base = {
      docType, // "receipt" | "invoice"
      // customer / order
      customer_name,
      email,
      phone_number,
      // delivery_details
      address,
      city,
      province,
      zip,
      country,
      shipping, // "ELTA" | "FedEx" | "BoxNow"
    };

    if (docType === "invoice") {
      return {
        ...base,
        company_name,
        vat_number,
        company_address,
        company_city,
        company_zip,
        occupation,
        tax_office,
      };
    }
    return base;
  };

  const validateForm = (): string | null => {
    if (!customer_name || !email || !phone_number) {
      return "Please fill customer name, email and phone number.";
    }
    if (!address || !city || !province || !zip || !country) {
      return "Please complete delivery address, city, province, zip and country.";
    }
    if (docType === "invoice") {
      if (
        !company_name ||
        !vat_number ||
        !company_address ||
        !company_city ||
        !company_zip ||
        !occupation ||
        !tax_office
      ) {
        return "Please complete all invoice fields.";
      }
    }
    if (!agree) {
      return "You must accept the Terms of Use.";
    }
    if (items.length === 0) {
      return "Your cart is empty.";
    }
    return null;
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData?.error || "Order creation failed.");
        return;
      }

      if (orderData.redirectUrl) {
        window.location.href = orderData.redirectUrl;
      } else {
        alert("Missing redirect URL from order response.");
      }
    } catch (err) {
      console.error("[Checkout Error]:", err);
      alert("Error connecting to server.");
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
                      value={customer_name}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone_number}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Country*
                    </label>
                    <input
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Address Line*
                    </label>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Province*
                    </label>
                    <select
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      ZIP Code*
                    </label>
                    <input
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Shipping options */}
                <div className="mt-6">
                  <p className="text-sm text-gray-700 mb-2">Shipping Options</p>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {(["ELTA", "FedEx", "BoxNow"] as const).map((s) => (
                      <label
                        key={s}
                        className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${
                          shipping === s
                            ? "border-blue-400 shadow-sm"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          className="h-4 w-4 text-blue-600"
                          checked={shipping === s}
                          onChange={() => setShipping(s)}
                        />
                        <div>
                          <div className="font-semibold">{s}</div>
                          {s === "ELTA" ? (
                            <div className="text-sm text-gray-500">
                              Delivery Cost: 4.35€
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Delivery Cost: 0.00€
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Billing (only if Invoice) */}
              {docType === "invoice" && (
                <section className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Billing Information (Invoice)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company Name*
                      </label>
                      <input
                        required
                        value={company_name}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        VAT Number*
                      </label>
                      <input
                        required
                        value={vat_number}
                        onChange={(e) => setVat(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        Company Address*
                      </label>
                      <input
                        required
                        value={company_address}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company City*
                      </label>
                      <input
                        required
                        value={company_city}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Company ZIP*
                      </label>
                      <input
                        required
                        value={company_zip}
                        onChange={(e) => setCompanyZip(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Profession / Occupation*
                      </label>
                      <input
                        required
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Tax Office*
                      </label>
                      <input
                        required
                        value={tax_office}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
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
                disabled={!agree || items.length === 0 || loading}
                className="w-full rounded-md bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Placing order..." : "Order Now"}
              </button>
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
