import { Product } from "@/types/product";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) return notFound();

  return (
    <>
      <Navbar />
      <div className="bg-white max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4">
            <img
              src="https://svkroboticsedu.com/uploads/items/2025-06-23-intelligence5-Photoroom.jpg"
              alt={product.name}
              className="w-full max-h-[400px] object-contain"
            />
          </div>
          <div className="flex mt-4 space-x-2">
            <img
              src="https://svkroboticsedu.com/uploads/items/2025-06-23-intelligence5-Photoroom.jpg"
              alt={product.name}
              className="w-16 h-16 rounded-md border cursor-pointer object-cover"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 text-xl mr-2">★ ★ ★ ★ ☆</span>
            <span className="text-gray-600">(4.5)</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">
            {product.description_full || product.description_short}
          </p>

          {/* Price */}
          <div className="flex items-center space-x-3 mb-6">
            <p className="text-3xl font-bold text-gray-900">
              {product.price} €
            </p>
            <p className="text-lg text-gray-500 line-through">4199.99 €</p>
          </div>

          <hr className="my-6" />

          {/* Additional Info */}
          <div className="space-y-2 text-gray-700 mb-6">
            <p>
              <strong>Brand:</strong> Generic
            </p>
            <p>
              <strong>Color:</strong> Multi
            </p>
            <p>
              <strong>Category:</strong> Camera
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition">
              Add to Cart
            </button>
            <button className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
              Buy now
            </button>
          </div>
        </div>
      </div>
      <FeaturedProducts />
      <Footer />
    </>
  );
}
