"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import Footer from "@/components/Footer";

const fallbackImage = "/logo.png";
const baseUrl = "https://svkroboticsedu.com";

interface Product {
  id: string;
  name: string;
  description_short: string;
  description_full?: string;
  price: string;
  images?: string[];
  category_name?: string;
  collaborator_name?: string;
}

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(fallbackImage);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${slug}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          setProduct(null);
          return;
        }

        const data = await res.json();
        setProduct(data.item);
        setSelectedImage(
          data.item.images?.[0] ? baseUrl + data.item.images[0] : fallbackImage
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <>
      <Navbar />
      <div className="bg-white max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full max-h-[400px] object-contain"
            />
          </div>

          <div className="flex mt-4 space-x-2">
            {(product.images?.length ? product.images : [fallbackImage]).map(
              (img, index) => {
                const fullImg = img.startsWith("/") ? baseUrl + img : img;
                return (
                  <img
                    key={index}
                    src={fullImg}
                    alt={`${product.name} image ${index + 1}`}
                    className={`w-16 h-16 rounded-md border cursor-pointer object-cover ${
                      selectedImage === fullImg ? "ring-2 ring-orange-500" : ""
                    }`}
                    onClick={() => setSelectedImage(fullImg)}
                  />
                );
              }
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 text-xl mr-2">★ ★ ★ ★ ☆</span>
            <span className="text-gray-600">(4.5)</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">
            {product.description_full || product.description_short}
          </p>

          {/* Price */}
          <div className="flex items-center space-x-3 mb-6">
            <p className="text-3xl font-bold text-gray-900">
              {product.price} €
            </p>
            <p className="text-lg text-gray-500 line-through">4199.99 €</p>
          </div>

          <hr className="my-6" />

          {/* Additional Info */}
          <div className="space-y-2 text-gray-700 mb-6">
            <p>
              <strong>Brand:</strong> {product.collaborator_name || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {product.category_name || "N/A"}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition">
              Add to Cart
            </button>
            <button className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
              Buy now
            </button>
          </div>
        </div>
      </div>
      {/* <FeaturedProducts /> */}
      <Footer />
    </>
  );
}
