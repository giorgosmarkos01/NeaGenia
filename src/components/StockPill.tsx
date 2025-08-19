"use client";

export default function StockPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();

  const { label, cls } =
    s === "available_immediately"
      ? {
          label: "In stock",
          cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        }
      : s === "available_after_ordering"
      ? {
          label: "Available to order",
          cls: "bg-amber-50 text-amber-700 ring-amber-200",
        }
      : s === "preorder"
      ? { label: "Preorder", cls: "bg-blue-50 text-blue-700 ring-blue-200" }
      : s === "ask_for_price"
      ? {
          label: "Ask for price",
          cls: "bg-zinc-50 text-zinc-700 ring-zinc-200",
        }
      : s === "currently_unavailable"
      ? { label: "Unavailable", cls: "bg-rose-50 text-rose-700 ring-rose-200" }
      : { label: "Status", cls: "bg-zinc-50 text-zinc-700 ring-zinc-200" };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}
