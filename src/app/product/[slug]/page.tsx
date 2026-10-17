import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { getProductBySlug } from "@/lib/store-data";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
