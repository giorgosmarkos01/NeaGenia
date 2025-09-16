"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();

        const mapped = (data || []).map((item: any) => ({
          id: item.product_id, // 🔁 convert product_id → id
          name: item.name,
          slug: item.slug,
          price: parseFloat(item.price), // 💸 από string σε number
          description_short: "", // fallback
          images: [], // fallback
          stock_status: "available_after_ordering", // fallback
        }));

        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      }
    };

    if (isSignedIn) {
      fetchWishlist();
    }
  }, [isSignedIn]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Η λίστα αγαπημένων σου ❤️
        </h1>

        {products.length === 0 ? (
          <p className="text-gray-500">Δεν έχεις προσθέσει προϊόντα ακόμα.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              if (!product?.id) return null; // 👉 Αγνόησε όσα δεν έχουν id
              return <ProductCard key={product.id} product={product} />;
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
