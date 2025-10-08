import { Suspense } from "react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import HeroBanner from "@/components/client/HeroBanner";
import ProductGrid, { ProductGridSkeleton } from "@/components/client/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  return (
    <>
      <Header />
      <HeroBanner />
      <div className="p-4 sm:p-6 bg-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-black text-center">
          Popular products
        </h1>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid category="popular" limit={24} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
