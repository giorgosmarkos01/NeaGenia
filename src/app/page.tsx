import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";

import { getAllProducts } from "@/data/product";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <Navbar />
      <HeroBanner />
      <div className="p-4 sm:p-6 bg-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-black text-center">
          Popular products
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
