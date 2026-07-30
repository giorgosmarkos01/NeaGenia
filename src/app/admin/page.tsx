import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, PackageOpen } from "lucide-react";
import { listAdminProducts } from "@/data/adminProducts";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import StockPill from "@/components/client/StockPill";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-white py-20 text-center">
          <PackageOpen className="h-10 w-10 text-zinc-400" />
          <p className="font-medium text-zinc-700">No products yet</p>
          <p className="text-sm text-zinc-500">
            Get your catalog started by adding your first product.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t transition hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Image
                      src={p.coverImage}
                      alt={p.name}
                      width={44}
                      height={44}
                      className="rounded-lg border object-cover"
                      style={{ width: 44, height: 44 }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{p.name}</span>
                    {p.highlight ? (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Highlighted
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{p.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold">
                    €{Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <StockPill status={p.stockStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        aria-label={`Edit ${p.name}`}
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-black"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
