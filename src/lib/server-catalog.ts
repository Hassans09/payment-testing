/**
 * Server-side catalogue reads for metadata, Open Graph and the sitemap.
 *
 * - Platform products (src/lib/seed-data.ts) are always known on the server.
 * - Marketplace listings and seller stores live in the API. In "http" mode with an ABSOLUTE
 *   NEXT_PUBLIC_API_BASE_URL they are fetched here (cached for 10 minutes). In "mock" mode they only
 *   exist in the shopper's browser, so pages fall back to generic metadata.
 * Every read fails soft: metadata must never break a page.
 */
import { API_BASE_URL, API_MODE, PLATFORM_SELLER_ID, SITE_NAME, SITE_URL } from "@/lib/config";
import { seedProducts, findSeedProduct } from "@/lib/seed-data";
import type { Product, PublicSellerProfile } from "@/lib/types";

const REVALIDATE_SECONDS = 600;

function apiUrl(path: string): string | null {
  if (API_MODE !== "http" || !/^https?:\/\//i.test(API_BASE_URL)) return null;
  return `${API_BASE_URL}${path}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  const url = apiUrl(path);
  if (!url) return null;
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** An approved product by slug or id: the platform catalogue first, then the API. */
export async function getServerProduct(slugOrId: string): Promise<Product | null> {
  const seed = findSeedProduct(slugOrId);
  if (seed) return seed.status === "approved" ? seed : null;
  const product = await getJson<Product>(`/products/${encodeURIComponent(slugOrId)}`);
  return product && product.status === "approved" ? product : null;
}

/** Every approved product the server can see (platform catalogue + API in http mode). */
export async function getServerProducts(): Promise<Product[]> {
  const fromApi = (await getJson<Product[]>("/products")) ?? [];
  const byId = new Map<string, Product>();
  for (const product of [...seedProducts, ...fromApi]) {
    if (product.status === "approved") byId.set(product.id, product);
  }
  return [...byId.values()];
}

export async function getServerSellerProfile(sellerId: string): Promise<PublicSellerProfile | null> {
  if (sellerId === PLATFORM_SELLER_ID) {
    return { id: PLATFORM_SELLER_ID, businessName: SITE_NAME, bio: "", logo: null, createdAt: "" };
  }
  return getJson<PublicSellerProfile>(`/sellers/${encodeURIComponent(sellerId)}`);
}

/** Absolute URL for an image path (Open Graph needs absolute URLs); data: URLs are dropped. */
export function absoluteImage(src: string | null | undefined): string | null {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return null;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Plain-text meta description, max ~160 characters. */
export function metaDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
