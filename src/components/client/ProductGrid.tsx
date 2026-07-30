import ProductCard from "@/components/client/ProductCard";
import {
  getProductsPopular,
  getProductsAll,
  getProductsByCategory,
} from "@/data/product";
import type { ProductSummary } from "@/types/product";

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

  if (key === "popular") {
    products = await getProductsPopular(limit);
  } else if (key === "all-items") {
    products = await getProductsAll(100);
  } else {
    products = await getProductsByCategory(key, limit);
  }

  if (!products.length) {
    return (
      <p className="col-span-full text-sm text-zinc-600 text-center py-6">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl ${className}`}
    >
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
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
