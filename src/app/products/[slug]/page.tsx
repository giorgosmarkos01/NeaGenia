import type { Metadata } from "next";
import ProductDetails from "./ProductDetails";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // 👈 must await

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/items/${slug}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        title: `${slug} | SVK ROBOTICS`,
        description: `Details and specifications for ${slug} from SVK ROBOTICS.`,
      };
    }

    const data = await res.json();
    const product = data.item;

    return {
      title: `${product?.name ?? slug} | SVK ROBOTICS`,
      description:
        product?.description_short ??
        `Details and specifications for ${slug} from SVK ROBOTICS.`,
    };
  } catch {
    return {
      title: `${slug} | SVK ROBOTICS`,
      description: `Details and specifications for ${slug} from SVK ROBOTICS.`,
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params; // 👈 must await
  return <ProductDetails slug={slug} />;
}
