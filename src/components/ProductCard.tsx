"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import StockPill from "./StockPill";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setWishlist } from "@/store/wishlistSlice";
import { useAuth } from "@clerk/nextjs";

interface ProductCardProps {
  product: Product;
}

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

export default function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();

  const wishlist: string[] = useSelector((s: any) => s.wishlist.items || []);
  const liked = wishlist.includes(product.id);

  const imageUrl = product.images?.length
    ? baseUrl + product.images[0]
    : fallbackImage;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || !isSignedIn) return;
    setLoading(true);

    try {
      if (!liked) {
        await fetch(`/api/wishlist/${product.id}`, { method: "POST" });
        dispatch(setWishlist([...wishlist, product.id]));
      } else {
        await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" });
        dispatch(setWishlist(wishlist.filter((id) => id !== product.id)));
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl transition transform p-3 sm:p-4 relative flex flex-col">
      {/* Wishlist icon */}
      {isSignedIn && (
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow hover:scale-110 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill={liked ? "#f97316" : "none"}
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
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="w-full h-36 sm:h-44 flex items-center justify-center bg-gray-50 rounded-lg mb-3 sm:mb-4 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            width={200}
            height={160}
            className="object-contain transition-transform duration-300 ease-in-out hover:scale-110"
            style={{ maxHeight: "10rem" }}
            sizes="(min-width: 640px) 160px, 128px"
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
        <span>
          <AddToCartButton product={product} />
          <StockPill status={product.stock_status} />
        </span>
      </div>
    </div>
  );
}
