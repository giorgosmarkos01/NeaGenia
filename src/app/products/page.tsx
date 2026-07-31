import type { Metadata } from "next";
import { Suspense } from "react";

import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import CategoryFilterBar from "@/components/server/CategoryFilterBar";
import Breadcrumbs from "@/components/client/Breadcrumbs";

import ProductGrid, { ProductGridSkeleton } from "@/components/client/ProductGrid";
import { getCategoryCounts } from "@/data/product";

export const metadata: Metadata = {
  title: "Products | NEA GENIA TECHNOLOGIES",
  description:
    "Browse all Nea Genia Technologies products including robot kits, parts, accessories and educational kits.",
};

type SearchParams = { category?: string | string[] };
type PageProps = { searchParams: Promise<SearchParams> };

function titleCaseFromSlug(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // normalize to a single lowercase string
  const activeCategory = Array.isArray(sp.category)
    ? sp.category[0]?.toLowerCase()
    : sp.category?.toLowerCase();

  // category list (with counts) for the filter bar
  const categories = await getCategoryCounts();

  const categoryForGrid = activeCategory ?? "popular";
  const pageTitle = activeCategory
    ? titleCaseFromSlug(activeCategory)
    : "Popular products";

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              {pageTitle}
            </h1>

            <CategoryFilterBar active={activeCategory ?? null} basePath="/products" />
          </div>

          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              ...(activeCategory ? [{ label: pageTitle }] : []),
            ]}
            separator="/"
          />

          {/* Self-fetching grid, streamed with fallback */}
          <div className="mt-4">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid category={categoryForGrid} limit={24} />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
