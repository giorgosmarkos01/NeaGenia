"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProductSummary } from "@/types/product";

const fallbackImage = "/logo.png";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // If input cleared or too short: reset results and stop loader after 1s max
    if (!q || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      const t = setTimeout(() => setLoading(false), 1000);
      debounceRef.current = t;
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        // Expecting data.items to be ProductSummary[]
        setResults(Array.isArray(data?.items) ? (data.items as ProductSummary[]) : []);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [q]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search products…"
        className="w-full rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-black shadow-sm 
          outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      />

      {/* Right icon / loader */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v4" stroke="currentColor" strokeWidth="4" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No results</div>
          ) : (
            <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      // 👇 Use coverImage exactly like ProductCard
                      src={item.coverImage || fallbackImage}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-contain rounded"
                      sizes="64px"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement & { src: string };
                        if (img.src !== fallbackImage) img.src = fallbackImage;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">€ {Number(item.price).toFixed(2)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
