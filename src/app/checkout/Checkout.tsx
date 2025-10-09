"use client";

import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCartItems, selectCount } from "@/store/cartSlice";
import { useMemo, useState, useEffect, useRef } from "react";
import countriesRaw from "@/assets/countries.json";
import greekProvincesRaw from "@/assets/greekStates.json";
import type { GreekRegion, Countries } from "@/types/location";
import { getShippingOptions, ShippingOption } from "@/lib/shipping";
import BoxNowMap from "@/components/client/BoxNowMap";

type DocType = "receipt" | "invoice";

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCount);

  useEffect(() => {
  // You should see an array of lines with id/slug/price/qty, etc.
  console.log("[Checkout] items from Redux >", items);
}, [items]);

  const [docType, setDocType] = useState<DocType>("receipt");
  const [agree, setAgree] = useState(false);
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

  const [shipping, setShipping] = useState<ShippingOption>("ELTA");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(
    getShippingOptions(country)
  );

  // --- Coupon state ---
  const [coupon, setCoupon] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);

  // itemId -> finalLineTotal (overlay from the server after coupon)
  const [couponLineTotals, setCouponLineTotals] = useState<Record<string, number>>({});

  // snapshot of before/after subtotals returned by API
  const [couponSummary, setCouponSummary] = useState<{ subtotalBefore: number; subtotalAfter: number } | null>(null);

  // Strictly typed lists
  const greekProvinces = greekProvincesRaw as GreekRegion[];
  const countries = countriesRaw as Countries[];

  // BoxNow locker
  const [boxNowLocker, setBoxNowLocker] = useState<any>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Επιτρέπεται μόνο + στην αρχή και μετά αριθμοί
    value = value.replace(/[^\d+]/g, "");

    // Αν δεν είναι το πρώτο χαρακτήρας το + → αφαίρεσέ το
    if (value.indexOf("+") > 0) {
      value = value.replace(/\+/g, "");
    }

    // Αν δεν έχει αρκετά ψηφία, απλά κρατάμε όσα έχει
    setPhone(value);
  };

  // -------- Discount-aware subtotal (use server snapshot if present) --------
  const discountedSubtotal = useMemo(() => {
    return items.reduce((sum, it: any) => {
      const base = Number(it?.price) * Number(it?.qty);
      const overlay = couponLineTotals[it.productId];  // <-- use productId
      return sum + (Number.isFinite(overlay) ? overlay : base);
    }, 0);
  }, [items, couponLineTotals]);

  const appliedDiscountAmount = useMemo(() => {
    if (!couponSummary) return 0;
    const diff = Number(couponSummary.subtotalBefore) - Number(couponSummary.subtotalAfter);
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  }, [couponSummary]);

  // -------- Shipping cost (dynamic) --------
  const [shippingFee, setShippingFee] = useState<number>(() =>
    shipping === "ELTA" ? 4.35 : shipping === "BoxNow" ? 3.0 : 10.0
  );
  const [shipCalcLoading, setShipCalcLoading] = useState(false);
  const [shipCalcError, setShipCalcError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightAbort = useRef<AbortController | null>(null);

  // Province options
  const provinceOptions = useMemo(() => {
    const arr = (greekProvinces as GreekRegion[])
      .map((r) => r.region)
      .filter(Boolean);
    return Array.from(new Set(arr)).sort((a, b) =>
      a.localeCompare(b, "el", { sensitivity: "base" })
    );
  }, [greekProvinces]);

  // Country options (pin “Greece” first)
  const countryOptions = useMemo(() => {
    const names = countries.map((c) => c.name).filter(Boolean);
    const unique = Array.from(new Set(names));
    const sorted = unique.sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    );
    const pinned = "Greece";
    return [pinned, ...sorted.filter((n) => n !== pinned)];
  }, [countries]);

  // Recompute visible shipping methods when country changes
  useEffect(() => {
    const opts = getShippingOptions(country);
    setShippingOptions(opts);
    if (!opts.includes(shipping)) {
      setShipping(opts[0]);
      setBoxNowLocker(null);
    }
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep `shipping` valid for country
  useEffect(() => {
    if (!shippingOptions.includes(shipping)) {
      setShipping(shippingOptions[0]);
      setBoxNowLocker(null);
    }
  }, [shippingOptions, shipping]);

  // -------- Dynamic ELTA price fetch (debounced 1.5s) --------
  useEffect(() => {
    // For non-ELTA or non-Greece, set static fee and bail
    if (country !== "Greece" || shipping !== "ELTA") {
      setShippingFee(shipping === "BoxNow" ? 3.0 : 10.0); // set your other carriers here if needed
      setShipCalcLoading(false);
      setShipCalcError(null);
      // Cancel any pending debounce or fetch
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (inFlightAbort.current) inFlightAbort.current.abort();
      return;
    }

    // Need city, province, zip to calculate
    if (!city || !province || !zip) {
      setShipCalcError(null);
      setShipCalcLoading(false);
      setShippingFee(4.35); // fallback default before user completes fields
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (inFlightAbort.current) inFlightAbort.current.abort();
      return;
    }

    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        // Abort any in-flight request
        if (inFlightAbort.current) inFlightAbort.current.abort();
        const ac = new AbortController();
        inFlightAbort.current = ac;

        setShipCalcLoading(true);
        setShipCalcError(null);

        // Prepare payload compatible with the API we built
        const payload = {
          city,
          province,
          zip,
          country,
          shippingOption: shipping,
          items: items.map((it: any) => ({
            // The API expects product.weight (grams) and quantity
            // If your Redux line doesn’t have weight, it’ll be 0 and price stays near base
            product: { weight: Number(it?.weight ?? 0) }, // adjust if you store weight elsewhere
            quantity: Number(it?.qty ?? 0),
          })),
        };

        const res = await fetch("/api/delivery/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ac.signal,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const price = Number(data?.deliveryCost);
        setShippingFee(Number.isFinite(price) ? price : 4.35);
        setShipCalcLoading(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return; // ignore aborted requests
        setShipCalcLoading(false);
        setShipCalcError("Could not calculate ELTA shipping right now.");
        setShippingFee(4.35); // fallback
      }
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [city, province, zip, country, shipping, items]);

  // Totals
  const grandTotal = useMemo(
    () => Number((discountedSubtotal + shippingFee).toFixed(2)),
    [discountedSubtotal, shippingFee]
  );

  const VatCost: number = Number((discountedSubtotal * 0.23).toFixed(2));

  // Form payload
  const buildPayload = () => {
    const base = {
      docType,
      customer_name,
      email,
      phone_number,
      address,
      city,
      province,
      zip,
      country,
      shipping,
      ...(shipping === "BoxNow" && boxNowLocker
        ? {
            boxnowLockerId: boxNowLocker.boxnowLockerId,
            boxnowLockerPostalCode: boxNowLocker.boxnowLockerPostalCode,
            boxnowLockerAddressLine1: boxNowLocker.boxnowLockerAddressLine1,
          }
        : {}),
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
    if (country === "Greece" && shipping === "BoxNow" && !boxNowLocker) {
      return "Please select a BoxNow locker.";
    }
    if (!agree) return "You must accept the Terms of Use.";
    if (items.length === 0) return "Your cart is empty.";
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
            <Link href="/products" className="text-blue-600 hover:underline">
              Go to products →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* LEFT */}
            <div className="md:col-span-2 space-y-6">
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={handlePhoneChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Country*
                    </label>
                    <select
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {countryOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Address Line*
                    </label>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Province</option>
                      {provinceOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
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
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Shipping options */}
                <div className="mt-6">
                  <p className="text-sm text-gray-700 mb-2">Shipping Options</p>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {shippingOptions.map((s) => (
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
                          <div className="text-sm text-gray-500">
                            {s === "ELTA" ? (
                              <>
                                Delivery Cost:{" "}
                                {shipCalcLoading ? (
                                  <span>calculating…</span>
                                ) : shipCalcError ? (
                                  <span title={shipCalcError}>
                                    {shippingFee.toFixed(2)}€
                                  </span>
                                ) : (
                                  <span>{shippingFee.toFixed(2)}€</span>
                                )}
                              </>
                            ) : s.toUpperCase() === "BOXNOW" ? (
                              <>Delivery Cost: 3.00€</>
                            ) : s.toUpperCase() === "FEDEX" ? (
                              <>Delivery Cost: 10.00€</>
                            ) : (
                              <>Delivery Cost: 0.00€</>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* BoxNow Map */}
                  {country === "Greece" && shipping === "BoxNow" && (
                    <div className="mt-4">
                      <BoxNowMap onSelect={setBoxNowLocker} />
                      <div className="mt-2 text-sm text-gray-600">
                        {boxNowLocker &&
                        boxNowLocker.boxnowLockerAddressLine1 ? (
                          <>
                            Selected: {boxNowLocker.boxnowLockerAddressLine1},{" "}
                            {boxNowLocker.boxnowLockerPostalCode}
                          </>
                        ) : (
                          <>BoxNow not selected — please select a locker.</>
                        )}
                      </div>
                    </div>
                  )}
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <span>{discountedSubtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (included):</span>
                  <span>{VatCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {shipCalcLoading
                      ? "calculating…"
                      : `${shippingFee.toFixed(2)}€`}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total Amount:</span>
                <span>
                  {Number(discountedSubtotal + shippingFee).toFixed(2)}€
                </span>
              </div>

              {appliedDiscountAmount > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Applied Discount:</span>
                  <span className="text-green-700">- {appliedDiscountAmount.toFixed(2)}€</span>
                </div>
              )}

              <label className="flex items-start gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <span>
                  I have read and agree to the{" "}
                  <Link
                    href="/terms-of-use"
                    className="text-blue-600 hover:underline"
                  >
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

              {/* Coupon section */}
              {!showCoupon ? (
                // Collapsed state: just a link-like button to reveal the input
                <button
                  type="button"
                  onClick={() => {
                    setShowCoupon(true);
                    setCouponError(null);
                  }}
                  className="mt-4 text-sm text-blue-600 hover:underline cursor-pointer"
                  aria-expanded="false"
                  aria-controls="coupon-panel"
                >
                  Add Discount Code
                </button>
              ) : (
                // Expanded state: your existing coupon UI
                <div id="coupon-panel" className="mt-4 space-y-2">
                  <label className="block text-sm text-gray-700">Add Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon"
                      className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      disabled={!coupon || couponApplying}
                      onClick={async () => {
                        setCouponApplying(true);
                        setCouponError(null);
                        try {
                          const payload = {
                            coupon,
                            items: items.map((it: any) => ({
                              itemId: it.productId,           // <-- was it.id / it.slug; use productId
                              unitPrice: Number(it.price),
                              qty: Number(it.qty),
                            })),
                          };
                          console.log("[Checkout] coupon payload >", payload);

                          const res = await fetch("/api/discounts/coupons", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          const data = await res.json();

                          if (!res.ok || !data?.ok) {
                            setCouponLineTotals({});
                            setCouponSummary(null);
                            setCouponError(data?.error || "Coupon not applicable.");
                          } else {
                            const map: Record<string, number> = {};
                            for (const r of data.results as any[]) {
                              // r.itemId will be the resolved UUID from the API
                              map[r.itemId] = Number(r.finalLineTotal);
                            }
                            setCouponLineTotals(map);
                            setCouponSummary({
                              subtotalBefore: Number(data.subtotalBefore),
                              subtotalAfter: Number(data.subtotalAfter),
                            });
                          }
                        } catch {
                          setCouponLineTotals({});
                          setCouponSummary(null);
                          setCouponError("Could not validate coupon right now.");
                        } finally {
                          setCouponApplying(false);
                        }
                      }}
                      className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {couponApplying ? "..." : "Apply"}
                    </button>
                  </div>

                  {couponError && <p className="text-sm text-red-600">{couponError}</p>}
                  {appliedDiscountAmount > 0 && (
                    <p className="text-sm text-green-700">
                      Coupon applied! You saved {appliedDiscountAmount.toFixed(2)}€ on items.
                    </p>
                  )}

                  {/* Optional: a hide link to collapse again */}
                  <button
                    type="button"
                    onClick={() => setShowCoupon(false)}
                    className="text-xs text-gray-500 hover:underline cursor-pointer"
                    aria-expanded="true"
                    aria-controls="coupon-panel"
                  >
                    Hide
                  </button>
                </div>
              )}
            </aside>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
