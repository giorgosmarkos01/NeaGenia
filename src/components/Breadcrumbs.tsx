"use client";

import Link from "next/link";
export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  // JSON-LD για SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: it.href ? `${it.href}` : undefined,
    })),
  };

  return (
    <nav className="mb-3 sm:mb-4" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-600">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-1">
              {it.href && !isLast ? (
                <Link
                  href={it.href}
                  className="rounded px-1 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  {it.label}
                </Link>
              ) : (
                <span
                  className="px-1 font-medium text-zinc-900"
                  aria-current="page"
                >
                  {it.label}
                </span>
              )}
              {!isLast && <span className="select-none text-zinc-400">/</span>}
            </li>
          );
        })}
      </ol>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
