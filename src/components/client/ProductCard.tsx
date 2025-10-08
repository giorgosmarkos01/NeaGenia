"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/nextjs";

import AddToCartButton from "@/components/client/AddProductCardToCartButton";
import StockPill from "./StockPill";

import type { ProductSummary } from "@/types/product";
import type { Discount } from "@/types/discount";
import { pickDiscountsForProduct } from "@/utils/discounts";

interface ProductCardProps {
  product: ProductSummary & {
    // add these if you have them available; otherwise omit and it still works for item-scoped discounts
    categoryId?: number;
    categoryPath?: number[];
  };
  discounts?: Discount[]; // 👈 category (or mixed) discounts passed from ProductGrid
}

export default function ProductCard({ product, discounts = [] }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();

  const wishlist: string[] = useSelector((s: any) => s.wishlist.items || []);
  const liked = wishlist.includes(product.id);

  const originalPrice = Number(product.price) || 0;

  // Compute price after discounts for *this* product
  const { finalPrice, applicable } = pickDiscountsForProduct(
    {
      id: product.id,
      price: originalPrice,
      categoryId: product.categoryId,
      categoryPath: product.categoryPath,
    },
    discounts
  );
  const isDiscounted = applicable.length > 0 && finalPrice < originalPrice;

  return (
    <div
      className="
        bg-white rounded-xl transition transform p-3 sm:p-4 relative
        flex flex-col
        md:h-[420px]
      "
    >
      {/* Wishlist icon */}
      {isSignedIn && (
        <button
          // onClick={toggleWishlist}
          disabled={loading}
          title={liked ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}
          aria-label="Εναλλαγή αγαπημένων"
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full shadow transition 
                ${liked ? "bg-orange-100" : "bg-white"} 
                hover:scale-110 focus:outline-none`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill={liked ? "#2516f9ff" : "none"}
            viewBox="0 0 24 24"
            stroke={liked ? "#2516f9ff" : "currentColor"}
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
      <div className="w-full h-32 sm:h-44 flex items-center justify-center bg-gray-50 rounded-lg mb-3 sm:mb-4 overflow-hidden relative">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.coverImage}
            alt={product.name}
            width={200}
            height={160}
            className="object-contain transition-transform duration-300 ease-in-out hover:scale-110"
            style={{ maxHeight: "10rem" }}
            sizes="(min-width: 640px) 160px, 128px"
          />
        </Link>

        {/* Add to Cart Button bottom-left only on mobile */}
        <div className="absolute bottom-0 left-0 sm:hidden">
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Title */}
      <Link href={`/products/${product.slug}`}>
        <h2 className="title-of-the-product text-sm sm:text-lg font-semibold mb-1 truncate">
          {product.name}
        </h2>
      </Link>

      {/* Description */}
      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">
        {product.descriptionShort}
      </p>

      {/* If discounted: show new price + ON-SALE label ABOVE the price/stock row */}
      {isDiscounted && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-red-600 font-semibold text-sm sm:text-base">
            {finalPrice.toFixed(2)} €
          </span>
          <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
            ON-SALE
          </span>
        </div>
      )}

      {/* Footer: push this block to the bottom for even alignment */}
      <div className="mt-auto">
        <div className="flex justify-between items-center">
          <p className="text-sm sm:text-base font-semibold text-gray-900">
            {isDiscounted ? (
              <span className="line-through text-zinc-500">
                {originalPrice.toFixed(2)} €
              </span>
            ) : (
              `${originalPrice.toFixed(2)} €`
            )}
          </p>

          {/* Stock pill (always shown) */}
          <div className="scale-90">
            <StockPill status={product.stockStatus} />
          </div>
        </div>

        {/* Add to Cart below price only on desktop */}
        <div className="hidden sm:flex mt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
