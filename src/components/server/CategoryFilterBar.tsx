// components/server/CategoryFilterBar.tsx
import { getCategoryCounts } from "@/data/product";
import { formatCategoryName } from "@/lib/format";
import CategoryFilterBarClient from "../client/CategoryFilterBarClient";

export default async function CategoryFilterBar({
  active,
  basePath = "/products",
}: {
  active?: string | null;
  basePath?: string;
}) {
  const raw = await getCategoryCounts();

  // Pull virtual counts
  const popularCount =
    raw.find((r) => r.slug === "popular")?.count ?? 0;
  const totalCount =
    raw.find((r) => r.slug === "all-items")?.count ?? 0;

  // DB categories only (exclude virtuals)
  const dbCategories = raw
    .filter((r) => r.slug !== "popular" && r.slug !== "all-items")
    .map((c) => ({
      slug: c.name, // you use category.name as the URL slug
      name: formatCategoryName(c.name), // "robot-kits" -> "Robot Kits"
      count: c.count ?? 0,
    }));

  return (
    <CategoryFilterBarClient
      categories={dbCategories}
      active={active ?? null}
      basePath={basePath}
      totalCount={totalCount}
      popularCount={popularCount}
    />
  );
}
