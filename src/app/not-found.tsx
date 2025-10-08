"use client";

import Navbar from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "@/../public/lotties/404.json";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gray-50 px-4">
        {/* Lottie Animation */}
        <div className="w-72 h-72 mb-6">
          <Lottie animationData={animationData} loop={true} />
        </div>

        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-6">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 text-blue-600 hover:text-blue-900 transition"
        >
          ← Back to Home
        </Link>
      </div>
      <Footer />
    </>
  );
}
