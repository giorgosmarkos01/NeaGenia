"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Breadcrumbs from "@/components/client/Breadcrumbs";
import { titleCaseFromSlug } from "@/lib/titleCaseFromSlug";
import StockPill from "@/components/client/StockPill";
import Image from "next/image";
import AddProductToCartButton from "./AddProductToCartButton";
import Link from "next/link";
import type { ProductDetail } from "@/types/product";
import type { Discount } from "@/types/discount";
import { pickDiscountsForProduct } from "@/utils/discounts";
import rehypeRaw from "rehype-raw";

const fallbackImage = "/logo.png";

// 👉 Custom markdown renderers
const markdownComponents: Components = {
  a: ({ node, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    />
  ),
  p: ({ node, children }) => {
    const onlyChild = Array.isArray(children) ? children[0] : children;

    // YouTube auto-embed
    if (
      typeof onlyChild === "string" &&
      onlyChild.startsWith("https://www.youtube.com")
    ) {
      const videoId = onlyChild.split("v=")[1];
      return (
        <div className="aspect-w-16 aspect-h-9 my-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    return <p>{children}</p>;
  },
};

export default function ProductDetailsClient({
  item,
  discounts = [],
}: {
  item: ProductDetail;
  /** Category- and/or item-scoped discounts passed in by parent/provider */
  discounts?: Discount[];
}) {
  const [selectedImage, setSelectedImage] = useState<string>(
    item.coverImage || fallbackImage
  );

  /* ---------- Discounts ---------- */
  const originalPrice = Number(item.price) || 0;

  const { finalPrice, applicable } = useMemo(() => {
    return pickDiscountsForProduct(
      {
        id: item.id,
        price: originalPrice,
        categoryId: item.categoryId,
      },
      discounts
    );
  }, [item.id, item.categoryId, originalPrice, discounts]);

  const isDiscounted = applicable.length > 0 && finalPrice < originalPrice;

  /* ---------- Variations state ---------- */
  const hasVariations = (item.variations?.length ?? 0) > 0;
  const isExclusive = useMemo(() => {
    return (
      hasVariations &&
      item.variations.every((v) => v.selectionType === "exclusive")
    );
  }, [hasVariations, item.variations]);

  const [selectedExclusiveId, setSelectedExclusiveId] = useState<number | null>(
    isExclusive ? item.variations[0]?.id ?? null : null
  );
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<Set<number>>(
    new Set()
  );

  const toggleOptional = (id: number) => {
    setSelectedOptionalIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 👉 Build the array the API expects
  const selectedVariantIds = useMemo(() => {
    if (!hasVariations) return [];
    if (isExclusive) return selectedExclusiveId ? [selectedExclusiveId] : [];
    return Array.from(selectedOptionalIds);
  }, [hasVariations, isExclusive, selectedExclusiveId, selectedOptionalIds]);

  // (Optional) prevent adding when exclusive but nothing selected
  const canAdd = !isExclusive || !!selectedExclusiveId;

  return (
    <>
      <Navbar />

      <div className="bg-white max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image Gallery */}
        <div>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              {
                label: titleCaseFromSlug(item.categoryName || ""),
                href: `/products?category=${item.categoryName ?? ""}`,
              },
              { label: item.name },
            ]}
            separator="/"
          />

          <div className="md:sticky md:top-28 md:self-start">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 h-[400px] relative">
              <Image
                src={selectedImage || fallbackImage}
                alt={item.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 700px"
                priority
              />
            </div>

            <div className="flex mt-4 gap-2">
              {(item.images?.length
                ? item.images
                : [{ url: fallbackImage }]
              ).map((img, index) => {
                const fullImg = img.url || fallbackImage;
                return (
                  <button
                    type="button"
                    key={index}
                    className={`relative w-16 h-16 rounded-md border overflow-hidden cursor-pointer focus:outline-none ${
                      selectedImage === fullImg ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedImage(fullImg)}
                    aria-label={`Select image ${index + 1}`}
                  >
                    <Image
                      src={fullImg}
                      alt={`${item.name} image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      sizes="64px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-6 text-black">{item.name}</h1>

          {isDiscounted && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-semibold text-red-600">
                {finalPrice.toFixed(2)} €
              </span>
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[12px] font-semibold text-red-600">
                ON-SALE
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <p className="text-3xl font-bold text-black">
              {isDiscounted ? (
                <span className="line-through text-zinc-500 text-2xl">
                  {originalPrice.toFixed(2)} €
                </span>
              ) : (
                `${originalPrice.toFixed(2)} €`
              )}
            </p>
            <StockPill status={item.stockStatus} />
          </div>

          <hr className="my-6" />

          {item.descriptionShort && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-black mb-2">
                Overview
              </h2>
              <p className="text-black/80">{item.descriptionShort}</p>
            </section>
          )}

          {item.groupId && item.groupItems && item.groupItems.length > 0 && (
            <>
              <hr className="my-6" />
              <section className="mb-2">
                <h3 className="text-lg font-semibold text-black mb-3">
                  More in this series
                </h3>
                <div className="flex flex-wrap gap-3">
                  {item.groupItems.map((g) => (
                    <Link
                      key={g.id}
                      href={`/products/${g.slug}`}
                      className="group inline-flex items-center gap-3 rounded-lg border px-3 py-2 bg-white hover:bg-gray-50 transition"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                        <Image
                          src={g.coverImage || fallbackImage}
                          alt={g.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-black group-hover:underline">
                          {g.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {Number(g.price).toFixed(2)} €
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {hasVariations && (
            <>
              <hr className="my-6" />
              <section className="mb-2">
                <h3 className="text-lg font-semibold text-black mb-3">
                  {isExclusive ? "Choose a version" : "Available options"}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {item.variations.map((v) => {
                    const priceLabel =
                      Number(v.variationPrice) > 0
                        ? `+${Number(v.variationPrice).toFixed(2)}€`
                        : "+0€";

                    if (isExclusive) {
                      const checked = selectedExclusiveId === v.id;
                      return (
                        <label
                          key={v.id}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${
                            checked
                              ? "border-blue-500 ring-1 ring-blue-300"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="variation"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={() => setSelectedExclusiveId(v.id)}
                          />
                          <span className="text-sm text-black">
                            {v.name}{" "}
                            <span className="text-gray-500">{priceLabel}</span>
                          </span>
                        </label>
                      );
                    }

                    const checked = selectedOptionalIds.has(v.id);
                    return (
                      <label
                        key={v.id}
                        className={`cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${
                          checked
                            ? "border-blue-500 ring-1 ring-blue-300"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={() => toggleOptional(v.id)}
                        />
                        <span className="text-sm text-black">
                          {v.name}{" "}
                          <span className="text-gray-500">{priceLabel}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {item.descriptionFull && (
            <>
              <hr className="my-6" />
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-black mb-2">
                  Description
                </h2>
                <div className="prose prose-blue max-w-none text-black">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {item.descriptionFull}
                  </ReactMarkdown>
                </div>
              </section>
            </>
          )}

          {item.specifications && (
            <>
              <hr className="my-6" />
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-black mb-2">
                  Specifications
                </h2>
                <div className="prose prose-blue max-w-none text-black">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {item.specifications}
                  </ReactMarkdown>
                </div>
              </section>
            </>
          )}

          <hr className="my-6" />

          <div className="flex items-center justify-start gap-4 mb-4">
            <AddProductToCartButton
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                price: Number(item.price),
                stockStatus: item.stockStatus as any,
                coverImage: item.coverImage || fallbackImage,
              }}
              variantIds={selectedVariantIds}
            />
            {!canAdd && (
              <span className="text-sm text-amber-700">
                Please choose a version before adding to cart.
              </span>
            )}
          </div>

          <div className="text-black">
            <strong>Category:</strong>{" "}
            {item.categoryName ? (
              <a
                className="text-blue-600 hover:underline"
                href={`/products?category=${item.categoryName}`}
              >
                {item.categoryName}
              </a>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
