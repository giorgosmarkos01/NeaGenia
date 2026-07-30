import { getCategories, getItemGroups, getCollaborators } from "@/data/adminProducts";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, groups, collaborators] = await Promise.all([
    getCategories(),
    getItemGroups(),
    getCollaborators(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Product</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ProductForm
          mode="create"
          categories={categories}
          groups={groups}
          collaborators={collaborators}
        />
      </div>
    </div>
  );
}
