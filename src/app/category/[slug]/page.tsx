import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryView } from "./category-view";
import { CATEGORIES, SITE_NAME, categoryName, isCategorySlug } from "@/lib/config";

/**
 * /category/[slug] for every slug in CATEGORIES. Categories without approved products still
 * resolve and show a friendly empty state (never a "coming soon" page); unknown slugs 404.
 */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isCategorySlug(slug)) return { title: "Category not found" };
  const name = categoryName(slug);
  return {
    title: name,
    description: `Shop ${name.toLowerCase()} from ${SITE_NAME} and approved independent sellers.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  return <CategoryView slug={slug} />;
}
