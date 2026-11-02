import { CATEGORIES, type CategorySlug } from "@/lib/config";
import type { CategorySummary, Product } from "@/lib/types";

/** Every category in CATEGORIES with its number of APPROVED products (the shape of GET /categories). */
export function summarizeCategories(products: Pick<Product, "category" | "status">[]): CategorySummary[] {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
    name: category.name,
    productCount: products.filter((product) => product.status === "approved" && product.category === category.slug).length,
  }));
}

/** Only the categories that have at least one approved product, in CATEGORIES order. */
export function nonEmptyCategories(summaries: CategorySummary[] | null | undefined): CategorySummary[] {
  return (summaries ?? []).filter((category) => category.productCount > 0);
}

export function categoryHref(slug: CategorySlug): string {
  return `/category/${slug}`;
}
