import type { MetadataRoute } from "next";

import { CATEGORIES, PLATFORM_SELLER_ID, SITE_URL } from "@/lib/config";
import { getServerProducts } from "@/lib/server-catalog";

/** Rebuilt at most every hour. Marketplace listings are included once the http API is connected. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/sell", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/track-order", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/help", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/delivery-returns", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ].map(({ path, priority, changeFrequency }) => ({ url: `${SITE_URL}${path}`, lastModified: now, priority, changeFrequency }));

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const products = await getServerProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt ?? product.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const sellerIds = new Set([PLATFORM_SELLER_ID, ...products.map((product) => product.sellerId)]);
  const sellerPages: MetadataRoute.Sitemap = [...sellerIds].map((id) => ({
    url: `${SITE_URL}/sellers/${encodeURIComponent(id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...categories, ...productPages, ...sellerPages];
}
