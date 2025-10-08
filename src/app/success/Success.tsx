"use client";

import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/cartSlice";
import Lottie from "lottie-react";

export default function Success() {
  const { user, isSignedIn } = useUser();
  const [animationData, setAnimationData] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const run = async () => {
      try {
        // (προαιρετικό) έλεγχος param
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");

        // Αν δεν έχεις ακόμα status από Viva, μπορείς προσωρινά να το παραλείψεις:
        // if (status !== "success") return;

        // 1) Καθάρισε Redux
        dispatch(clearCart());

        // 2) Καθάρισε DB + cookie cartId
        await fetch("/api/cart/clear", { method: "POST" });
      } catch (err) {
        console.error("❌ Failed to clear cart server-side:", err);
      }
    };

    run();

    // Lottie loader
    fetch("/lotties/OrderConfirmed.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("❌ Failed to load Lottie:", err));
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            className="w-[300px] h-[300px] mb-6"
          />
        )}

        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>

        {isSignedIn ? (
          <p className="text-lg text-gray-700 mb-6">
            Thank you{user?.firstName ? `, ${user.firstName}` : ""}! Your order
            has been received and is being processed.
          </p>
        ) : (
          <p className="text-lg text-gray-700 mb-6"></p>
        )}

        <Link
          href="/products"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </>
  );
}
