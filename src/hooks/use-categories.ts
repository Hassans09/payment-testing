"use client";

import { usePathname } from "next/navigation";

import { useAsync } from "@/hooks/use-async";
import { getCategories } from "@/lib/api";
import { nonEmptyCategories, summarizeCategories } from "@/lib/categories";
import { seedProducts } from "@/lib/seed-data";

/** Rendered on the server and on first paint, so the nav never flashes empty. */
const initialSummaries = summarizeCategories(seedProducts);

/**
 * Categories with at least one approved product, refreshed on every navigation so a category
 * appears as soon as an admin approves the first listing in it.
 */
export function useNonEmptyCategories() {
  const pathname = usePathname();
  const { data } = useAsync(() => getCategories(), [pathname], initialSummaries);
  return nonEmptyCategories(data);
}
