import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItemDetailBySlug, getRelatedProducts } from "@/data/product";
import ProductDetailsClient from "@/components/client/ProductDetailsClient";

export const dynamic = "force-dynamic";

type Params = { slug: string };

/* ---------- Metadata ---------- */
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const item = await getItemDetailBySlug(slug);
    if (!item) {
      return {
        title: `${slug} | NEA GENIA TECHNOLOGIES`,
        description: `Details and specifications for ${slug} from NEA GENIA TECHNOLOGIES.`,
      };
    }
    return {
      title: `${item.name} | NEA GENIA TECHNOLOGIES`,
      description:
        item.descriptionShort ??
        `Details and specifications for ${item.name} from NEA GENIA TECHNOLOGIES.`,
      openGraph: {
        images: item.coverImage ? [item.coverImage] : [],
      },
    };
  } catch {
    return {
      title: `${slug} | NEA GENIA TECHNOLOGIES`,
      description: `Details and specifications for ${slug} from NEA GENIA TECHNOLOGIES.`,
    };
  }
}

/* ---------- Page ---------- */
export default async function ProductPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;

  const item = await getItemDetailBySlug(slug);
  if (!item) notFound();               // <-- narrow here

  let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  let debugInfo = "";
  try {
    relatedProducts = await getRelatedProducts(item.categoryId, item.id, 4);
    debugInfo = `categoryId=${item.categoryId} itemId=${item.id} count=${relatedProducts.length}`;
  } catch (e) {
    debugInfo = `ERROR: ${e instanceof Error ? e.message + " | " + e.stack : String(e)}`;
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `<!-- DEBUG-RELATED: ${debugInfo.replace(/-->/g, "")} -->` }} />
      <ProductDetailsClient item={item} relatedProducts={relatedProducts} />
    </>
  ); // item is ProductDetail now
}
