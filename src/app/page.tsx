import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6">Καλώς ήρθες στο e‑shop!</h1>
          <p className="text-gray-600 mb-8">
            Ανακάλυψε τα πιο δημοφιλή προϊόντα μας.
          </p>
          <a
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Δες τα προϊόντα
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
