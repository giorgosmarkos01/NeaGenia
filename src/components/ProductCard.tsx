"use client";
import { Product } from "@/types/product";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-3 sm:p-4 relative flex flex-col cursor-pointer">
        {/* Wishlist icon */}
        <button
          onClick={(e) => e.preventDefault()} // prevents Link from triggering
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow hover:scale-110 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 
                12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 
                0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 
                3 16.5 3 19.58 3 22 5.42 22 
                8.5c0 3.78-3.4 6.86-8.55 
                11.54L12 21.35z"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="w-full h-36 sm:h-44 flex items-center justify-center bg-gray-50 rounded-lg mb-3 sm:mb-4 overflow-hidden">
          <img
            src="https://svkroboticsedu.com/uploads/items/2025-06-23-intelligence5-Photoroom.jpg"
            alt={product.name}
            className="max-h-32 sm:max-h-40 object-contain transition-transform duration-300 ease-in-out hover:scale-110"
          />
        </div>

        {/* Title & description */}
        <h2 className="text-sm sm:text-lg text-black font-semibold mb-1 truncate">
          {product.name}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">
          {product.description_short}
        </p>

        {/* Price & button */}
        <div className="flex justify-between items-center mt-auto">
          <p className="text-base sm:text-xl font-bold text-gray-900">
            {product.price} €
          </p>
          <button
            onClick={(e) => e.preventDefault()}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-100 transition"
          >
            Buy now
          </button>
        </div>
      </div>
    </Link>
  );
}
