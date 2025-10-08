"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({
  items,
  className = "",
  separator = "/",
  includeHomeIcon = true,
}: {
  items: Crumb[];
  className?: string;
  separator?: string;
  includeHomeIcon?: boolean;
}) {
  const pathname = usePathname();

  // JSON-LD for SEO
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.label,
        item: it.href ? it.href : undefined,
      })),
    }),
    [items]
  );

  return (
    <nav
      className={`relative -mx-2 overflow-x-auto no-scrollbar ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="mx-2 inline-flex items-center gap-1 text-sm">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          const content =
            it.href && !isLast ? (
              <Link
                href={it.href}
                className="group inline-flex items-center rounded-lg px-2 py-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition"
              >
                {includeHomeIcon && i === 0 ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="mr-1 h-4 w-4 opacity-70 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3l9 8-1.5 1.5L18 10.5V20h-5v-5H11v5H6v-9.5L4.5 12.5 3 11l9-8z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
                <span className="truncate">{it.label}</span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center rounded-lg px-2 py-1 font-medium text-zinc-900 bg-zinc-50/60"
                aria-current="page"
                title={it.label}
              >
                {includeHomeIcon && i === 0 ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="mr-1 h-4 w-4 opacity-70"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3l9 8-1.5 1.5L18 10.5V20h-5v-5H11v5H6v-9.5L4.5 12.5 3 11l9-8z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
                <span className="truncate">{it.label}</span>
              </span>
            );

          return (
            <li key={`${it.label}-${i}`} className="flex items-center">
              {content}
              {!isLast && (
                <span className="mx-1 select-none text-zinc-400">
                  {separator}
                </span>
              )}
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
