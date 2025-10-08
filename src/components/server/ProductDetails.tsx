import { getItemDetailBySlug } from "@/data/product";
import ProductDetailsClient from "@/components/client/ProductDetailsClient";
import { notFound } from "next/navigation";

export default async function ProductDetails({ slug }: { slug: string }) {
  const item = await getItemDetailBySlug(slug).catch(() => null);
  if (!item) notFound();

  // Pass the fully-hydrated item to the client component
  return <ProductDetailsClient item={item} />;
}
