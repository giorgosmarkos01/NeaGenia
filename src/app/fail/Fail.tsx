"use client";

import Navbar from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function FailPage() {
  const { isSignedIn } = useUser();

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-700 mb-6">
          Oops! Something went wrong with your payment.{" "}
          {isSignedIn
            ? "Please try again."
            : "You may need to sign in and try again."}
        </p>
        <div className="flex space-x-4">
          <Link
            href="/checkout"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Try Again
          </Link>
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="px-6 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
