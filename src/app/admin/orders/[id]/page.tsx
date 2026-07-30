import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminOrderById } from "@/data/adminOrders";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderId.slice(0, 8)}…</h1>
          <p className="text-sm text-zinc-500">
            Placed{" "}
            {new Date(order.orderDate).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.orderId} initialStatus={order.paymentStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Customer
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Name</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium">{order.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Phone</dt>
              <dd className="font-medium">{order.phoneNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Order type</dt>
              <dd className="font-medium capitalize">{order.orderType}</dd>
            </div>
            {order.couponCode && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Coupon</dt>
                <dd className="font-medium">{order.couponCode}</dd>
              </div>
            )}
            {order.orderCode && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Viva order code</dt>
                <dd className="font-mono text-xs">{order.orderCode}</dd>
              </div>
            )}
          </dl>
        </div>

        {order.delivery && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Delivery
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Address</dt>
                <dd className="text-right font-medium">
                  {order.delivery.addressLine}
                  <br />
                  {order.delivery.zip} {order.delivery.city}, {order.delivery.province}
                  <br />
                  {order.delivery.country}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Shipping option</dt>
                <dd className="font-medium">{order.delivery.shippingOption ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Shipping cost</dt>
                <dd className="font-medium">
                  {order.delivery.cost ? `€${Number(order.delivery.cost).toFixed(2)}` : "—"}
                </dd>
              </div>
              {order.delivery.boxNowLockerId && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">BoxNow locker</dt>
                  <dd className="text-right font-medium">
                    {order.delivery.boxNowLockerId}
                    <br />
                    {order.delivery.boxNowLockerAddressLine1}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {order.invoice && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Invoice Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Company</dt>
                <dd className="font-medium">{order.invoice.companyName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Address</dt>
                <dd className="text-right font-medium">
                  {order.invoice.companyAddress}
                  <br />
                  {order.invoice.companyZip} {order.invoice.companyCity}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">VAT number</dt>
                <dd className="font-medium">{order.invoice.vatNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Occupation</dt>
                <dd className="font-medium">{order.invoice.occupation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Tax office</dt>
                <dd className="font-medium">{order.invoice.taxOffice}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Items
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Variation</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Unit Price</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.orderItemId} className="border-t">
                  <td className="py-3">
                    {item.itemName}
                    {item.itemProductCode && (
                      <span className="ml-2 text-xs text-zinc-400">
                        ({item.itemProductCode})
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-zinc-600">{item.itemVariationName ?? "—"}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">€{Number(item.price).toFixed(2)}</td>
                  <td className="py-3 text-right font-medium">
                    €{Number(item.totalPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={4} className="py-3 text-right font-semibold">
                  Total
                </td>
                <td className="py-3 text-right text-lg font-bold">
                  €{Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
