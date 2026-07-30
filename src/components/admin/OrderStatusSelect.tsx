"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/lib/orderStatus";
import { useToast } from "./ToastProvider";

const inputClass =
  "rounded-lg border border-black bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black";

export default function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: PaymentStatus;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: PaymentStatus) => {
    const previous = status;
    setStatus(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(previous);
        showToast(data.error || "Failed to update status", "error");
        return;
      }
      showToast("Payment status updated", "success");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className={inputClass}
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as PaymentStatus)}
    >
      {PAYMENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
