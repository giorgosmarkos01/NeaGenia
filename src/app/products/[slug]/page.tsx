import type { Metadata } from "next";
import ProductDetails from "./ProductDetails";

type Props = { params: { slug: string } };

// ✅ Δυναμικό metadata για SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug} | SVK ROBOTICS`,
    description: `Details and specifications for ${params.slug} from SVK ROBOTICS.`,
  };
}

export default function ProductPage({ params }: Props) {
  return <ProductDetails slug={params.slug} />;
}
