import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center bg-gray-50">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-6">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2  text-orange-600 hover:text-orange-900"
        >
          ← Back to Home
        </Link>
      </div>
      <Footer />
    </>
  );
}
