"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux"; // ✅ Προσθήκη
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { setWishlist } from "@/store/wishlistSlice";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { isSignedIn } = useAuth();
  const dispatch = useDispatch(); // ✅ Προσθήκη

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;

        const data = await res.json();
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: parseFloat(item.price),
          description_short: item.description_short ?? "",
          images: [], // Add actual image URLs if available
          stock_status: item.stock_status ?? "available_after_ordering",
        }));

        setProducts(mapped);
        dispatch(setWishlist(mapped.map((p: Product) => p.id)));
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      }
    };

    if (isSignedIn) {
      fetchWishlist();
    }
  }, [isSignedIn, dispatch]);

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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
