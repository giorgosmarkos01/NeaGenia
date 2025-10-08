"use client";

type Conf = { label: string; cls: string };

const MAP: Record<string, Conf> = {
  available_immediately: {
    label: "In stock",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  available_after_ordering: {
    label: "Available after order",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  available_3_to_5_days: {
    label: "3–5 days",
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  available_7_to_10_days: {
    label: "7–10 days",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  preorder: {
    label: "Preorder",
    cls: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  ask_for_price: {
    label: "Ask for price",
    cls: "bg-zinc-50 text-zinc-700 ring-zinc-200",
  },
  currently_unavailable: {
    label: "Unavailable",
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

function normalize(v?: string) {
  // trim, lowercase, convert spaces/hyphens → underscores
  return (v || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export default function StockPill({ status }: { status?: string }) {
  const key = normalize(status);
  const conf = MAP[key] ?? { label: "Status unknown", cls: "bg-zinc-50 text-zinc-700 ring-zinc-200" };

  // Uncomment temporarily to debug incoming values
  console.log(`[StockPill] raw="${status}" normalized="${key}"`);

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${conf.cls}`}>
      {conf.label}
    </span>
  );
}
