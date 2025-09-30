"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { titleCaseFromSlug } from "@/lib/titleCaseFromSlug";
import StockPill from "@/components/StockPill";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
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
  stock_status?: string;
}

export default function ProductDetails({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(fallbackImage);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${slug}`,
          { cache: "no-store" }
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
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              {
                label: titleCaseFromSlug(product.category_name || ""),
                href: `/products?category=${product.category_name}`,
              },
              { label: product.name }, // current page
            ]}
            separator="/"
          />

          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 h-[400px] relative">
            <Image
              src={selectedImage || fallbackImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>

          <div className="flex mt-4 space-x-2">
            {(product.images?.length ? product.images : [fallbackImage]).map(
              (img, index) => {
                const fullImg = img.startsWith("/") ? baseUrl + img : img;
                return (
                  <div
                    key={index}
                    className={`relative w-16 h-16 rounded-md border overflow-hidden cursor-pointer ${
                      selectedImage === fullImg ? "ring-2 ring-orange-500" : ""
                    }`}
                    onClick={() => setSelectedImage(fullImg)}
                  >
                    <Image
                      src={fullImg}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      sizes="64px"
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 text-xl mr-2">★ ★ ★ ★ ☆</span>
            <span className="text-gray-600">(4.5)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3 mb-6">
            <StockPill status={product.stock_status} />
            <p className="text-3xl font-bold text-black">{product.price} €</p>
          </div>

          <hr className="my-6" />

          {/* Markdown Description */}
          <div className="prose prose-orange max-w-none text-black">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {product.description_full || product.description_short || ""}
            </ReactMarkdown>
          </div>

          <hr className="my-6" />

          {/* Additional Info */}
          <div className="space-y-2 text-black mb-6">
            <p>
              <strong>Brand:</strong> {product.collaborator_name || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {product.category_name || "N/A"}
            </p>
          </div>

          {/* Buttons */}
          {/* Buttons */}
          <div className="flex space-x-4">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
