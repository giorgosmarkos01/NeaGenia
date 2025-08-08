import Navbar from "@/components/Navbar";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
async function getProducts(): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/get/highlighted`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.items; // <- fix here
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <HeroBanner />
      <div className="p-4 sm:p-6 bg-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Popular products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
      {/* <FeaturedProducts /> */}
      <Footer />
    </>
  );
}
