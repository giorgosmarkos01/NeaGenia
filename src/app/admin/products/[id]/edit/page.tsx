import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getCategories,
  getItemGroups,
  getCollaborators,
} from "@/data/adminProducts";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const [product, categories, groups, collaborators] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
    getItemGroups(),
    getCollaborators(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Product</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          groups={groups}
          collaborators={collaborators}
          initialValues={{
            name: product.name,
            slug: product.slug,
            productCode: product.productCode ?? "",
            hsCode: product.hsCode ?? "",
            categoryId: String(product.categoryId),
            groupId: product.groupId ? String(product.groupId) : "",
            collaboratorId: product.collaboratorId
              ? String(product.collaboratorId)
              : "",
            stock: String(product.stock),
            stockStatus: product.stockStatus,
            descriptionShort: product.descriptionShort,
            descriptionFull: product.descriptionFull ?? "",
            specifications: product.specifications ?? "",
            price: String(product.price),
            weight: String(product.weight),
            highlight: !!product.highlight,
            images: product.images,
            variations: product.variations.map((v) => ({
              name: v.name,
              variationPrice: String(v.variationPrice),
              selectionType: v.selectionType,
            })),
            onSale: !!product.discount,
            discountType: product.discount?.type ?? "percent",
            discountValue: product.discount ? String(product.discount.value) : "0",
            discountStartsAt: product.discount?.startsAt ?? "",
            discountEndsAt: product.discount?.endsAt ?? "",
          }}
        />
      </div>
    </div>
  );
}
