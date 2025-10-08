import ProductCard from "@/components/client/ProductCard";
import {
  getProductsPopular,
  getProductsAll,
  getProductsByCategory,
} from "@/data/product";
import type { ProductSummary } from "@/types/product";

import { getDiscountsByCategorySlug } from "@/data/discount";
import { DiscountsProvider } from "@/providers/DiscountProvider";
import type { Discount } from "@/types/discount";

type ProductGridProps = {
  category?: string;
  limit?: number;
  className?: string;
  emptyMessage?: string;
};

export default async function ProductGrid({
  category = "popular",
  limit = 24,
  className = "",
  emptyMessage = "No products found.",
}: ProductGridProps) {
  const key = category.toLowerCase();
  let products: ProductSummary[] = [];
  let discountsForProvider: Discount[] = [];

  if (key === "popular") {
    products = await getProductsPopular(limit);
  } else if (key === "all-items") {
    products = await getProductsAll(limit);
  } else {
    // category grid
    products = await getProductsByCategory(key, limit);

    // fetch raw summaries
    const raw = await getDiscountsByCategorySlug(key); // returns DiscountSummary[]

    // normalize -> Discount[]
    discountsForProvider = raw.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,                // "fixed" | "percent"
      value: d.value,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      stackable: d.stackable,
      couponCode: d.couponCode,
      scope: "category",
      appliesTo: { categoryId: d.appliesToCategoryId },
    }));
  }

  if (!products.length) {
    return (
      <p className="col-span-full text-sm text-zinc-600 text-center py-6">
        {emptyMessage}
      </p>
    );
  }

  return (
    <DiscountsProvider discounts={discountsForProvider}>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl ${className}`}
      >
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </DiscountsProvider>
  );
}


// Lightweight Suspense Grid Skeleton
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-60 rounded-xl border bg-white animate-pulse" />
      ))}
    </div>
  );
}
