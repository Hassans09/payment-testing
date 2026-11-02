"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpDown } from "lucide-react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { useNonEmptyCategories } from "@/hooks/use-categories";
import { getProducts } from "@/lib/api";
import { categoryHref } from "@/lib/categories";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/product-sort";
import type { Product } from "@/lib/types";

const ON_HOME = 12;
/** 2 rows on phones (2 columns), 1 row on wide screens: visible at once, never waiting on the reveal. */
const EAGER_CARDS = 4;

/** Short sort labels so the control stays small next to the chips on phones. */
const SHORT_SORT_LABEL: Record<string, string> = {
  discover: "Discover",
  newest: "Newest",
  "price-asc": "Price: low",
  "price-desc": "Price: high",
  name: "Name A–Z",
};

const chip =
  "inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-[11px] font-bold uppercase tracking-wider transition";
const chipOff = "border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/75 hover:bg-[color:var(--brand-soft)]/50";

/**
 * The homepage product feed: a heading, one tidy row (category chips that scroll sideways on
 * phones, the item count from tablet up, and sort), then one grid mixing Rebel Fashion's own
 * products with approved seller listings. `initial` (the platform catalogue) is rendered on the
 * server so products are in the first HTML; the API result (which adds marketplace listings)
 * replaces it.
 */
export function HomeProducts({ initial }: { initial: Product[] }) {
  const categories = useNonEmptyCategories();
  const { data } = useAsync(() => getProducts(), [], initial);
  const [sort, setSort] = useState<SortKey>("discover");

  const products = sortProducts(data ?? [], sort);
  const visible = products.slice(0, ON_HOME);

  return (
    <section
      id="shop"
      aria-labelledby="home-products-title"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8"
    >
      <h2 id="home-products-title" className="text-xl font-extrabold leading-tight tracking-tight text-[color:var(--brand-deep)] sm:text-3xl">
        New in &amp; trending
      </h2>

      <div className="mb-5 mt-3 flex items-center gap-3 sm:mb-8 sm:mt-4">
        {categories.length > 0 ? (
          <nav
            aria-label="Shop by category"
            className="min-w-0 flex-1 overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]"
          >
            <div className="flex w-max gap-2 pr-6 sm:pr-0">
              <Link href="/shop" className={`${chip} border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] text-white`}>
                All
              </Link>
              {categories.map((category) => (
                <Link key={category.slug} href={categoryHref(category.slug)} className={`${chip} ${chipOff}`}>
                  {category.name}
                </Link>
              ))}
              <Link href="/shop?sold=marketplace" className={`${chip} ${chipOff}`}>
                From our sellers
              </Link>
            </div>
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <p className="hidden shrink-0 text-xs text-[color:var(--brand-charcoal)]/55 md:block" aria-live="polite">
          {products.length} items
        </p>

        <label htmlFor="home-sort" className="relative flex min-h-10 shrink-0 items-center rounded-full border border-[color:var(--brand-border)] bg-white pl-3 pr-2">
          <span className="sr-only">Sort products</span>
          <ArrowUpDown className="pointer-events-none h-3.5 w-3.5 shrink-0 text-[color:var(--brand-charcoal)]/55" aria-hidden="true" />
          <select
            id="home-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="min-h-10 max-w-[7.5rem] cursor-pointer [field-sizing:content] bg-transparent pl-1.5 text-base font-semibold text-[color:var(--brand-deep)] focus:outline-none sm:max-w-[10.5rem] sm:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {SHORT_SORT_LABEL[option.value] ?? option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {data ? <ProductGrid products={visible} eagerCount={EAGER_CARDS} /> : <ProductGridSkeleton count={4} />}

      <div className="mt-10 flex justify-center sm:mt-14">
        <Link
          href={sort === "discover" ? "/shop" : `/shop?sort=${sort}`}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 sm:w-auto"
        >
          View all {products.length} products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
