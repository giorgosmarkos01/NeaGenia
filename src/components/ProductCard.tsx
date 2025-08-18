"use client";
import { useState } from "react";
import { Product } from "@/types/product";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductCardProps {
  product: Product;
}

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

export default function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  const imageUrl =
    product.images && product.images.length > 0
      ? baseUrl + product.images[0]
      : fallbackImage;

  return (
    <div className="bg-white rounded-xl transition transform p-3 sm:p-4 relative flex flex-col">
      {/* Wishlist icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked((prev) => !prev);
        }}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow hover:scale-110 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill={liked ? "#f97316" : "none"} // orange when liked
          viewBox="0 0 24 24"
          stroke={liked ? "#f97316" : "currentColor"}
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 
               12.28 2 8.5 2 5.42 4.42 3 7.5 3
               c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
               14.76 3 16.5 3 19.58 3 22 5.42 22 
               8.5c0 3.78-3.4 6.86-8.55 
               11.54L12 21.35z"
          />
        </svg>
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
