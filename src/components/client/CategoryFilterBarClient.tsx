"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export type Category = { slug: string; name: string; count: number };

export default function CategoryFilterBarClient({
  categories,          // DB categories only (no "popular"/"all-items")
  active,
  basePath = "/products",
  totalCount,          // for "All Items"
  popularCount = 0,    // for "Popular"
}: {
  categories: Category[];
  active?: string | null;
  basePath?: string;
  totalCount: number;
  popularCount?: number;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const buildUrl = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("category", slug);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Final list: virtuals first, then DB categories
  const fullList = useMemo<Category[]>(
    () => [
      { slug: "popular", name: "Popular", count: popularCount },
      { slug: "all-items", name: "All Items", count: totalCount },
      ...categories,
    ],
    [categories, totalCount, popularCount]
  );

  // If nothing active, default to "popular"
  const activeEntry =
    fullList.find((c) => c.slug === active) ?? fullList[0];

  return (
    <div className="w-full border-b border-gray-200">
      {/* Desktop */}
      <div className="hidden md:flex gap-6 py-3">
        {fullList.map((c) => {
          const isActive =
            (active ? active === c.slug : c.slug === "popular");
          return (
            <Link
              key={c.slug}
              href={buildUrl(c.slug)}
              className={`whitespace-nowrap text-sm font-medium transition ${
                isActive
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {c.name}
              <span
                className={`ml-1 text-xs ${
                  isActive ? "text-black/70" : "text-gray-400"
                }`}
              >
                ({c.count})
              </span>
            </Link>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex justify-between items-center rounded-lg border px-4 py-2 text-sm font-medium bg-white text-black"
        >
          {activeEntry.name} ({activeEntry.count})
          <svg
            className={`h-4 w-4 ml-2 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="mt-2 flex flex-col gap-2 rounded-lg border p-2 bg-white shadow">
            {fullList.map((c) => {
              const isActive =
                (active ? active === c.slug : c.slug === "popular");
              return (
                <Link
                  key={c.slug}
                  href={buildUrl(c.slug)}
                  onClick={() => setOpen(false)}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {c.name} ({c.count})
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
