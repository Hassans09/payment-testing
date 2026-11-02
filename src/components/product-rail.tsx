"use client";

import type { ReactNode } from "react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { getProducts } from "@/lib/api";
import { PLATFORM_SELLER_ID } from "@/lib/config";
import type { Product, ProductFilters } from "@/lib/types";

/**
 * Grid of approved products from the API (platform products + approved seller
 * listings). `initial` is rendered on the server so the page is never empty.
 */
export function ProductRail({
  filters = {},
  initial,
  limit = 8,
  mode = "featured",
  source = "all",
  emptyState = null,
}: {
  filters?: ProductFilters;
  initial?: Product[];
  limit?: number;
  mode?: "featured" | "newest";
  /** "platform" = Rebel Fashion's own products, "marketplace" = approved seller products. */
  source?: "all" | "platform" | "marketplace";
  /** Shown when there is nothing to list (e.g. no approved seller products yet). */
  emptyState?: ReactNode;
}) {
  const { data } = useAsync(() => getProducts(filters), [filters], initial);

  if (!data) return <ProductGridSkeleton count={4} />;

  const visible = data.filter((product) =>
    source === "all" ? true : source === "platform" ? product.sellerId === PLATFORM_SELLER_ID : product.sellerId !== PLATFORM_SELLER_ID
  );
  const sorted = [...visible].sort((a, b) => {
    if (mode === "featured" && Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (sorted.length === 0) return <>{emptyState}</>;

  return <ProductGrid products={sorted.slice(0, limit)} />;
}
