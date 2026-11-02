import type { Metadata } from "next";

import { ProductPageClient } from "@/components/product-page-client";
import { SITE_NAME, categoryName } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { findSeedProduct } from "@/lib/seed-data";
import { absoluteImage, getServerProduct, metaDescription } from "@/lib/server-catalog";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProduct(slug);
  if (!product) {
    // Marketplace listings in the demo store only exist in the browser: generic, but still shareable.
    return { title: "Product", description: `Shop fashion from ${SITE_NAME} and independent sellers across Nigeria.` };
  }
  const title = product.name; // the root layout adds "| Rebel Fashion"
  const description = metaDescription(
    `${formatPrice(product.price)} · ${categoryName(product.category)} sold by ${product.sellerName}. ${product.description}`
  );
  const image = absoluteImage(product.images[0] ?? product.colors[0]?.image);
  const images = image ? [{ url: image, alt: product.name }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { type: "website", siteName: SITE_NAME, title: `${product.name} | ${SITE_NAME}`, description, url: `/product/${product.slug}`, images },
    twitter: { card: image ? "summary_large_image" : "summary", title: `${product.name} | ${SITE_NAME}`, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  // Platform catalogue items render immediately on the server; seller listings
  // (which only exist in the API) are loaded in the browser.
  const initialProduct = findSeedProduct(slug);
  return (
    <ProductPageClient
      slug={slug}
      initialProduct={initialProduct && initialProduct.status === "approved" ? initialProduct : null}
    />
  );
}
