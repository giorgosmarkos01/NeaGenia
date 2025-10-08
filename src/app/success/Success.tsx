"use client";

import Navbar from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SuccessPage() {
  const { user, isSignedIn } = useUser();

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>

        {isSignedIn ? (
          <p className="text-lg text-gray-700 mb-6">
            Thank you{user?.firstName ? `, ${user.firstName}` : ""}! Your order
            has been received and is being processed.
          </p>
        ) : (
          <p className="text-lg text-gray-700 mb-6">
            Thank you! Your order has been received.{" "}
            <Link href="/sign-in" className="text-orange-500 underline">
              Sign in
            </Link>{" "}
            to view your orders.
          </p>
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
