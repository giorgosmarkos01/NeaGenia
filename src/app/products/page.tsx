import Navbar from "@/components/Navbar";
import { ProductSummary } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CategoryFilterBar from "@/components/CategoryFilterBar";
import Breadcrumbs from "@/components/Breadcrumbs";

import { getAllProducts } from "@/data/product";

type SearchParams = { category?: string | string[] };
type PageProps = { searchParams: Promise<SearchParams> };

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

function titleCaseFromSlug(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

type Category = { slug: string; name: string; count: number };

function buildCategories(items: any[]): Category[] {
  const map = new Map<string, Category>();
  for (const p of items) {
    const slug = String(p.category_name ?? "").toLowerCase();
    if (!slug) continue;
    const name = titleCaseFromSlug(slug);
    const prev = map.get(slug);
    map.set(slug, { slug, name, count: (prev?.count ?? 0) + 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // ✅ await before using
  const sp = await searchParams;

  // normalize to a single lowercase string
  const activeCategory = Array.isArray(sp.category)
    ? sp.category[0]?.toLowerCase()
    : sp.category?.toLowerCase();

  // φέρε όλα τα προϊόντα μία φορά
  const all = await getAllProducts();

  // χτίσε categories με σωστά counts
  const categories = buildCategories(all);

  // φιλτράρισμα προϊόντων
  const products = activeCategory
    ? all.filter(
        (p: any) =>
          String(p.category_name ?? "").toLowerCase() === activeCategory
      )
    : all;

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 text-black">
            {activeCategory
              ? titleCaseFromSlug(activeCategory)
              : "Popular products"}
          </h1>

          <CategoryFilterBar
            categories={categories}
            active={activeCategory ?? null}
            basePath="/products"
          />

          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              ...(activeCategory
                ? [{ label: titleCaseFromSlug(activeCategory) }]
                : []),
            ]}
            separator="/"
          />

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
            {products.length ? (
              products.map((p: ProductSummary) => <ProductCard key={p.slug} product={p} />)
            ) : (
              <p className="col-span-full text-sm text-zinc-600">
                No products found
                {activeCategory
                  ? ` in “${titleCaseFromSlug(activeCategory)}”`
                  : ""}
                .
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
