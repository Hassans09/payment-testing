import { PLATFORM_SELLER_ID } from "@/lib/config";
import type { Product } from "@/lib/types";

/** Sort options shared by the homepage grid and the shop / category catalogue. */
export const SORT_OPTIONS = [
  { value: "discover", label: "Discover (mixed)" },
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export function parseSort(value: string | null | undefined): SortKey {
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortKey) : "discover";
}

type Sortable = Pick<Product, "sellerId" | "featured" | "createdAt" | "price" | "name">;

const byFeaturedThenNewest = (a: Sortable, b: Sortable) =>
  Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.createdAt.localeCompare(a.createdAt);

/**
 * "Discover": Rebel Fashion's own products and marketplace sellers' products interleaved
 * (one of ours, one from a seller, …), each side featured-first then newest. Deterministic, so
 * the server render and the browser agree (no hydration mismatch) and the first row always
 * shows both kinds of product once sellers have approved listings.
 */
function discoverMix<T extends Sortable>(products: T[]): T[] {
  const platform = products.filter((product) => product.sellerId === PLATFORM_SELLER_ID).sort(byFeaturedThenNewest);
  const marketplace = products.filter((product) => product.sellerId !== PLATFORM_SELLER_ID).sort(byFeaturedThenNewest);
  const mixed: T[] = [];
  for (let index = 0; index < Math.max(platform.length, marketplace.length); index += 1) {
    if (platform[index]) mixed.push(platform[index]);
    if (marketplace[index]) mixed.push(marketplace[index]);
  }
  return mixed;
}

export function sortProducts<T extends Sortable>(products: readonly T[], sort: SortKey): T[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    case "price-desc":
      return list.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    default:
      return discoverMix(list);
  }
}
