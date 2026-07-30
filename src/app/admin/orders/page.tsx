import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { listAdminOrders } from "@/data/adminOrders";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = PAYMENT_STATUSES.includes(status as PaymentStatus)
    ? (status as PaymentStatus)
    : undefined;

  const orders = await listAdminOrders(statusFilter);

  const tabs: { label: string; value: PaymentStatus | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => {
          const href = tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders";
          const active = statusFilter === tab.value;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active ? "bg-black text-white" : "bg-white text-zinc-600 border hover:bg-zinc-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-white py-20 text-center">
          <ReceiptText className="h-10 w-10 text-zinc-400" />
          <p className="font-medium text-zinc-700">No orders found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} className="border-t transition hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.orderId}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {o.orderId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-zinc-500">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {new Date(o.orderDate).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 capitalize text-zinc-600">{o.orderType}</td>
                  <td className="px-4 py-3 font-semibold">€{Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
