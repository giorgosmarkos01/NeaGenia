"use client";

export default function StockPill({ status }: { status?: string }) {
  const MAP = {
    available_immediately: { label: "In stock", cls: "bg-emerald-500" },
    available_after_ordering: {
      label: "Available after order",
      cls: "bg-amber-500",
    },
    available_3_to_5_days: { label: "3–5 days", cls: "bg-sky-500" },
    available_7_to_10_days: { label: "7–10 days", cls: "bg-indigo-500" },
    preorder: { label: "Preorder", cls: "bg-blue-500" },
    ask_for_price: { label: "Ask for price", cls: "bg-zinc-500" },
    currently_unavailable: { label: "Unavailable", cls: "bg-rose-500" },
  };

  function normalize(v?: string) {
    return (v || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }

  const key = normalize(status);
  const conf = MAP[key as keyof typeof MAP] ?? {
    label: "Status unknown",
    cls: "bg-zinc-400",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-full ${conf.cls}`} />
      <span className="text-sm text-gray-700">{conf.label}</span>
    </div>
  );
}
