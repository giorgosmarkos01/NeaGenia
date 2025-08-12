"use client";
import { Product } from "@/types/product";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductCardProps {
  product: Product;
}

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.images && product.images.length > 0
      ? baseUrl + product.images[0]
      : fallbackImage;

  return (
    <div className="bg-white rounded-xl transition transform p-3 sm:p-4 relative flex flex-col">
      {/* Wishlist icon */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow hover:scale-110 transition"
      >
        ❤️
      </button>

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="w-full h-36 sm:h-44 flex items-center justify-center bg-gray-50 rounded-lg mb-3 sm:mb-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-32 sm:max-h-40 object-contain transition-transform duration-300 ease-in-out hover:scale-110"
          />
        </div>
      </Link>

      {/* Title */}
      <Link href={`/products/${product.slug}`}>
        <h2 className="text-sm sm:text-lg text-black font-semibold mb-1 truncate">
          {product.name}
        </h2>
      </Link>

      {/* Description */}
      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">
        {product.description_short}
      </p>

      {/* Price & Add to Cart */}
      <div className="flex justify-between items-center mt-auto">
        <p className="text-base sm:text-xl font-bold text-gray-900">
          {product.price} €
        </p>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
