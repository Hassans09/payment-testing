"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { useNonEmptyCategories } from "@/hooks/use-categories";
import { getProducts } from "@/lib/api";
import { categoryHref } from "@/lib/categories";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/product-sort";
import type { Product } from "@/lib/types";

const FIRST_PAGE = 12;
const MAX_ON_HOME = 24;
/** 2 rows on phones (2 columns), 1 row on wide screens: visible at once, never waiting on the reveal. */
const EAGER_CARDS = 4;

const chip =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition";
const chipOff = "border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/50";

/**
 * The homepage product feed: category chips (only categories with approved products), item
 * count + sort, then one grid mixing Rebel Fashion's own products with approved seller
 * listings. `initial` (the platform catalogue) is rendered on the server so products are in
 * the first HTML; the API result (which adds marketplace listings) replaces it.
 */
export function HomeProducts({ initial }: { initial: Product[] }) {
  const categories = useNonEmptyCategories();
  const { data } = useAsync(() => getProducts(), [], initial);
  const [sort, setSort] = useState<SortKey>("discover");
  const [count, setCount] = useState(FIRST_PAGE);

  const products = sortProducts(data ?? [], sort);
  const visible = products.slice(0, count);
  const canLoadMore = count < Math.min(products.length, MAX_ON_HOME);

  return (
    <section id="shop" aria-labelledby="home-products-title" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-10 sm:px-6 lg:px-8">
      {categories.length > 0 && (
        <nav aria-label="Shop by category" className="mb-3 overflow-x-auto scrollbar-none">
          <div className="flex w-max gap-2">
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
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h2 id="home-products-title" className="text-[1.4rem] font-extrabold leading-tight tracking-tight text-[color:var(--brand-deep)] sm:text-3xl">
            New in &amp; trending
          </h2>
          <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60" aria-live="polite">
            <strong className="font-bold text-[color:var(--brand-deep)]">{products.length}</strong> items from us and our sellers
          </p>
        </div>
        <label htmlFor="home-sort" className="flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white pl-3.5 pr-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Sort</span>
          <select
            id="home-sort"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortKey);
              setCount(FIRST_PAGE);
            }}
            className="min-h-10 max-w-[10.5rem] cursor-pointer bg-transparent text-base font-semibold text-[color:var(--brand-deep)] focus:outline-none sm:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {data ? <ProductGrid products={visible} eagerCount={EAGER_CARDS} /> : <ProductGridSkeleton count={4} />}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {canLoadMore && (
          <button
            type="button"
            onClick={() => setCount((value) => Math.min(value + FIRST_PAGE, MAX_ON_HOME))}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 sm:w-auto"
          >
            Load more
          </button>
        )}
        <Link
          href={sort === "discover" ? "/shop" : `/shop?sort=${sort}`}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)] sm:w-auto"
        >
          View all {products.length} products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
