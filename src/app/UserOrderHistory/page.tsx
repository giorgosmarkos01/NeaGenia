"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Order {
  order_id: string;
  total_amount: number;
  order_date: string;
  payment_status: string;
  order_type: string;
  address_line?: string;
  city?: string;
  zip?: string;
  country?: string;
  shipping_option?: string;
  company_name?: string;
  vat_number?: string;
  tax_office?: string;
}

export default function UserOrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/userOrderHistory");
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          const fixed = data.orders.map((o: any) => ({
            ...o,
            total_amount: Number(o.total_amount),
          }));
          setOrders(fixed);
        }
      } catch (error) {
        console.error("Failed to fetch order history", error);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Your <span className="text-orange-500">Orders</span>
        </h1>

        {orders.length === 0 ? (
          <p className="text-black">No previous orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="border rounded-lg shadow-sm p-4 bg-white"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-black font-semibold">Order ID:</p>
                    <p className="text-sm break-all">{order.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black font-semibold">Date:</p>
                    <p className="text-sm">
                      {new Date(order.order_date).toLocaleString("el-GR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong className="text-black">Amount:</strong> €
                      {order.total_amount.toFixed(2)}
                    </p>
                    <p>
                      <strong className="text-black">Status:</strong>{" "}
                      {order.payment_status}
                    </p>
                    <p>
                      <strong className="text-black">Type:</strong>{" "}
                      {order.order_type}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-black">Shipping:</strong>{" "}
                      {order.shipping_option || "N/A"}
                    </p>
                    <p>
                      <strong className="text-black">Address:</strong>{" "}
                      {order.address_line}, {order.zip} {order.city},{" "}
                      {order.country}
                    </p>
                  </div>
                </div>

                {order.order_type === "invoice" && (
                  <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                    <p>
                      <strong>Company:</strong> {order.company_name}
                    </p>
                    <p>
                      <strong>VAT:</strong> {order.vat_number}
                    </p>
                    <p>
                      <strong>Tax Office:</strong> {order.tax_office}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
