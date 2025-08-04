import Navbar from "@/components/Navbar";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Popular products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 ml-auto mr-auto max-w-6xl">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      <FeaturedProducts />
      <Footer />
    </>
  );
}
