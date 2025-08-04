import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

async function getFeaturedProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/api/products/featured", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!Array.isArray(products) || products.length === 0) {
    return <p className="p-4 text-gray-500">No featured products available.</p>;
  }

  return (
    <section className="my-10 p-4 sm:p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-neutral-900">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
