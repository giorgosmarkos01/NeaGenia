import { listCategories } from "@/data/adminTaxonomy";
import SimpleEntityManager from "@/components/admin/SimpleEntityManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <SimpleEntityManager
        label="Category"
        apiBasePath="/api/admin/categories"
        entities={categories}
      />
    </div>
  );
}
