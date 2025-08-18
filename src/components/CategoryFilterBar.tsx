"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export type Category = { slug: string; name: string; count: number };

export default function CategoryFilterBar({
  categories,
  active,
  basePath = "/products",
}: {
  categories: Category[];
  active?: string | null;
  basePath?: string;
}) {
  const searchParams = useSearchParams();

  const buildUrl = (slug?: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!slug) params.delete("category");
    else params.set("category", slug);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const total = categories.reduce((n, c) => n + (c.count || 0), 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 overflow-x-auto py-2">
        {/* ALL */}
        <Link
          href={buildUrl(undefined)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition
            ${
              !active
                ? "bg-black text-white border-black"
                : "bg-white hover:bg-zinc-50"
            }`}
        >
          All
          <span
            className={`ml-2 text-xs ${
              !active ? "text-white/80" : "text-zinc-500"
            }`}
          >
            {total}
          </span>
        </Link>

        {/* CATEGORIES */}
        {categories.map((c) => {
          const isActive = active === c.slug;
          return (
            <Link
              key={c.slug}
              href={buildUrl(c.slug)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition
                ${
                  isActive
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-zinc-50"
                }`}
              aria-current={isActive ? "page" : undefined}
            >
              {c.name}
              <span
                className={`ml-2 text-xs ${
                  isActive ? "text-white/80" : "text-zinc-500"
                }`}
              >
                {c.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
