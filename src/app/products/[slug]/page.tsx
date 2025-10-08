import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItemDetailBySlug } from "@/data/product";
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
        title: `${slug} | SVK ROBOTICS`,
        description: `Details and specifications for ${slug} from SVK ROBOTICS.`,
      };
    }
    return {
      title: `${item.name} | SVK ROBOTICS`,
      description:
        item.descriptionShort ??
        `Details and specifications for ${item.name} from SVK ROBOTICS.`,
      openGraph: {
        images: item.coverImage ? [item.coverImage] : [],
      },
    };
  } catch {
    return {
      title: `${slug} | SVK ROBOTICS`,
      description: `Details and specifications for ${slug} from SVK ROBOTICS.`,
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

  return <ProductDetailsClient item={item} />; // item is ProductDetail now
}
