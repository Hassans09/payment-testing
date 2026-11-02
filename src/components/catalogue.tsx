"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Filter, RotateCcw, Search, SlidersHorizontal, Store } from "lucide-react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { useNonEmptyCategories } from "@/hooks/use-categories";
import { getProducts } from "@/lib/api";
import { categoryHref } from "@/lib/categories";
import { PLATFORM_SELLER_ID, SITE_NAME, categoryName, type CategorySlug } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/product-sort";
import { seedProducts } from "@/lib/seed-data";
import type { Gender } from "@/lib/types";

const MAX_PRICE = 100000;
const MIN_PRICE = 10000;
/** Products per "page"; "Load more" adds another page. */
const PAGE_SIZE = 24;
/** Cards in the first row(s) render visible immediately (no waiting on the scroll reveal). */
const EAGER_CARDS = 4;

export type SoldBy = "all" | "platform" | "marketplace";

const genderTabs: { value: Gender | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

const soldByOptions: { value: SoldBy; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "platform", label: SITE_NAME },
  { value: "marketplace", label: "Marketplace sellers" },
];

export function parseGender(value: string | null | undefined): Gender | "all" {
  return value === "men" || value === "women" || value === "kids" ? value : "all";
}

export function parseSoldBy(value: string | null | undefined): SoldBy {
  return value === "platform" || value === "rebel" ? "platform" : value === "marketplace" ? "marketplace" : "all";
}

const chipBase =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition";
const chipOn = "border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] text-white";
const chipOff = "border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/50";

/**
 * The product listing used by /shop (all products) and /category/[slug] (one category).
 * Products first: a short title, the category chips, one compact toolbar (Refine · count · Sort),
 * then the grid. The Refine panel (gender, sold by, search, price cap) is folded away until
 * opened, or opens on its own when the URL already carries a filter.
 */
export function Catalogue({
  category,
  initialSearch = "",
  initialGender = "all",
  initialSoldBy = "all",
  initialSort = "discover",
}: {
  category?: CategorySlug;
  initialSearch?: string;
  initialGender?: Gender | "all";
  initialSoldBy?: SoldBy;
  initialSort?: SortKey;
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGender, setSelectedGender] = useState<Gender | "all">(initialGender);
  const [soldBy, setSoldBy] = useState<SoldBy>(initialSoldBy);
  const [sortBy, setSortBy] = useState<SortKey>(initialSort);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [refineOpen, setRefineOpen] = useState(initialGender !== "all" || initialSoldBy !== "all" || Boolean(initialSearch));
  const [pages, setPages] = useState(1);
  const refineId = useId();
  const categories = useNonEmptyCategories();

  const initialProducts = useMemo(
    () => seedProducts.filter((product) => product.status === "approved" && (!category || product.category === category)),
    [category]
  );
  const { data, loading } = useAsync(() => getProducts(category ? { category } : {}), [category], initialProducts);
  const products = useMemo(() => data ?? [], [data]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesGender = selectedGender === "all" || product.gender === selectedGender || product.gender === "unisex";
      const matchesSeller =
        soldBy === "all" || (soldBy === "platform" ? product.sellerId === PLATFORM_SELLER_ID : product.sellerId !== PLATFORM_SELLER_ID);
      const matchesPrice = product.price <= maxPrice;
      const matchesSearch =
        term.length === 0 ||
        [
          product.name,
          product.description,
          categoryName(product.category),
          product.productType,
          product.material,
          product.sellerName,
          ...product.colors.map((color) => color.name),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesGender && matchesSeller && matchesPrice && matchesSearch;
    });

    return sortProducts(nextProducts, sortBy);
  }, [products, maxPrice, searchTerm, selectedGender, soldBy, sortBy]);

  const genderLabel = genderTabs.find((tab) => tab.value === selectedGender)?.label;
  const title = category ? categoryName(category) : "All products";
  const activeFilterCount =
    Number(selectedGender !== "all") + Number(soldBy !== "all") + Number(Boolean(searchTerm)) + Number(maxPrice < MAX_PRICE);
  const hasFilters = activeFilterCount > 0 || sortBy !== "discover";
  const visibleProducts = filteredProducts.slice(0, pages * PAGE_SIZE);
  const remaining = filteredProducts.length - visibleProducts.length;

  const handleReset = () => {
    setSelectedGender("all");
    setSoldBy("all");
    setSearchTerm("");
    setSortBy("discover");
    setMaxPrice(MAX_PRICE);
    setPages(1);
  };

  const categoryIsEmpty = Boolean(category) && !loading && products.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-4 flex flex-col gap-2 border-b border-[color:var(--brand-border)] pb-4 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            {category ? (
              <>
                <Link href="/shop" className="-my-3 inline-block py-3 hover:underline">
                  Shop
                </Link>{" "}
                / {title}
              </>
            ) : (
              "Shop"
            )}
          </span>
          <h1 className="font-display mt-1 text-3xl text-[color:var(--brand-deep)] sm:text-5xl">
            {title}
            {selectedGender !== "all" && <span className="text-[color:var(--brand-primary)]"> · {genderLabel}</span>}
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs text-[color:var(--brand-charcoal)]/75 sm:text-sm">
            {category
              ? `${title} from ${SITE_NAME} and approved independent sellers.`
              : `Clothing, shoes, bags and accessories from ${SITE_NAME} and approved independent sellers.`}
          </p>
        </div>
      </div>

      {/* Category chips: only categories that have approved products */}
      {categories.length > 0 && (
        <nav aria-label="Categories" className="mb-4 overflow-x-auto scrollbar-none">
          <div className="flex w-max gap-2">
            <Link href="/shop" className={`${chipBase} ${!category ? chipOn : chipOff}`} aria-current={!category ? "page" : undefined}>
              All
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={categoryHref(item.slug)}
                aria-current={category === item.slug ? "page" : undefined}
                className={`${chipBase} ${category === item.slug ? chipOn : chipOff}`}
              >
                {item.name}
                <span className="ml-1.5 opacity-60">{item.productCount}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {categoryIsEmpty ? (
        <EmptyCategory name={title} />
      ) : (
        <>
          {/* One compact toolbar: Refine (folds the filters away), item count, sort. */}
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-expanded={refineOpen}
              aria-controls={refineId}
              onClick={() => setRefineOpen((open) => !open)}
              className={`${chipBase} gap-2 ${refineOpen || activeFilterCount > 0 ? chipOn : chipOff}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Refine
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 text-[10px]" aria-label={`${activeFilterCount} active`}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${refineOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60" aria-live="polite">
              <strong className="font-bold text-[color:var(--brand-deep)]">{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "item" : "items"}
            </span>
            <label htmlFor="catalogue-sort" className="ml-auto flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white pl-3.5 pr-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Sort</span>
              <select
                id="catalogue-sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortKey);
                  setPages(1);
                }}
                className="min-h-10 max-w-[11rem] cursor-pointer bg-transparent text-base font-semibold text-[color:var(--brand-deep)] focus:outline-none sm:text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            id={refineId}
            hidden={!refineOpen}
            className="rf-pop mb-6 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4 shadow-[0_12px_30px_rgba(91,64,50,0.04)] sm:p-5"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="Gender" className="flex w-full gap-1 overflow-x-auto rounded-full border border-[color:var(--brand-border)] bg-white p-1 scrollbar-none md:w-fit">
              {genderTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={selectedGender === tab.value}
                  onClick={() => setSelectedGender(tab.value)}
                  className={`min-h-11 flex-1 shrink-0 whitespace-nowrap rounded-full px-2.5 text-xs min-[360px]:px-4 font-bold uppercase tracking-wider transition sm:px-5 md:flex-none ${
                    selectedGender === tab.value
                      ? "bg-[color:var(--brand-deep)] text-white"
                      : "text-[color:var(--brand-charcoal)]/75 hover:bg-[color:var(--brand-soft)]/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div role="group" aria-label="Sold by" className="flex flex-wrap items-center gap-2">
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
                <Store className="h-3.5 w-3.5" /> Sold by
              </span>
              {soldByOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={soldBy === option.value}
                  onClick={() => setSoldBy(option.value)}
                  className={`${chipBase} px-3 normal-case tracking-normal ${soldBy === option.value ? chipOn : chipOff}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            </div>
            <div className="grid items-end gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
              <div>
                <label htmlFor="catalogue-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
                  Search
                </label>
                <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3.5 focus-within:border-[color:var(--brand-primary)]">
                  <Search className="h-4 w-4 shrink-0 text-[color:var(--brand-chocolate)]/60" />
                  <input
                    id="catalogue-search"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, colour, seller..."
                    className="w-full min-w-0 bg-transparent text-base text-[color:var(--brand-charcoal)] placeholder:text-[color:var(--brand-charcoal)]/45 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="catalogue-price" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
                    Max price
                  </label>
                  <span className="text-xs font-bold text-[color:var(--brand-deep)]">{formatPrice(maxPrice)}</span>
                </div>
                <div className="flex min-h-11 items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4">
                  <input
                    id="catalogue-price"
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[color:var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>

            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[color:var(--brand-border)]/60 pt-3">
                <span className="flex items-center gap-1 text-xs font-medium text-[color:var(--brand-charcoal)]/60">
                  <Filter className="h-3 w-3" />
                  Active filters:
                </span>
                {selectedGender !== "all" && <FilterTag>{genderLabel}</FilterTag>}
                {soldBy !== "all" && <FilterTag>{soldByOptions.find((option) => option.value === soldBy)?.label}</FilterTag>}
                {searchTerm && <FilterTag>&ldquo;{searchTerm}&rdquo;</FilterTag>}
                {maxPrice < MAX_PRICE && <FilterTag>Up to {formatPrice(maxPrice)}</FilterTag>}
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-auto flex min-h-11 items-center gap-1 px-2 text-xs font-semibold text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset all
                </button>
              </div>
            )}
          </div>

          {loading && products.length === 0 ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length > 0 ? (
            <>
              <ProductGrid products={visibleProducts} eagerCount={EAGER_CARDS} />
              {remaining > 0 && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPages((value) => value + 1)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50"
                  >
                    Load more
                  </button>
                  <span className="text-xs text-[color:var(--brand-charcoal)]/60">
                    Showing {visibleProducts.length} of {filteredProducts.length}
                  </span>
                </div>
              )}
            </>
          ) : soldBy === "marketplace" && !hasOtherFilters(selectedGender, searchTerm, maxPrice) ? (
            <EmptyMarketplace />
          ) : (
            <div className="rounded-[28px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold text-[color:var(--brand-deep)]">No products match your filters</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--brand-charcoal)]/70">
                Try a higher price cap, a different search, or another gender or seller.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-6 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm transition hover:bg-[color:var(--brand-secondary)]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset filters</span>
              </button>
            </div>
          )}
        </>
      )}

      <div data-reveal className="mt-14 rounded-[26px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/40 p-6 shadow-[0_16px_40px_rgba(91,64,50,0.03)] sm:mt-16 sm:rounded-[30px] sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]/75">
              For designers, tailors &amp; boutiques
            </span>
            <h2 className="font-display mt-2 text-3xl text-[color:var(--brand-deep)] sm:text-4xl">Sell your fashion here.</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">
              List any clothing, shoes, bags or accessories. Open a free seller account, upload your pieces and get paid to your
              bank account.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-7 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm transition hover:bg-[color:var(--brand-secondary)]"
          >
            Start selling
          </Link>
        </div>
      </div>
    </div>
  );
}

function hasOtherFilters(gender: Gender | "all", search: string, maxPrice: number) {
  return gender !== "all" || Boolean(search) || maxPrice < MAX_PRICE;
}

function FilterTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
      {children}
    </span>
  );
}

function EmptyCategory({ name }: { name: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 text-center sm:p-12">
      <h2 className="text-2xl font-bold text-[color:var(--brand-deep)]">Nothing in {name} just yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--brand-charcoal)]/70">
        This category fills up as sellers list pieces and our team approves them. In the meantime, there&apos;s plenty to
        discover in the shop.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-7 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]"
        >
          Browse all products <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/sell"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-7 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50"
        >
          Sell {name.toLowerCase()} with us
        </Link>
      </div>
    </div>
  );
}

function EmptyMarketplace() {
  return (
    <div className="rounded-[28px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 text-center sm:p-12">
      <Store className="mx-auto h-9 w-9 text-[color:var(--brand-primary)]" />
      <h2 className="mt-3 text-2xl font-bold text-[color:var(--brand-deep)]">Our first sellers are setting up shop</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--brand-charcoal)]/70">
        Approved seller products will appear here. Make or sell fashion? Be one of the first stores shoppers see.
      </p>
      <Link
        href="/seller/signup"
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-7 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]"
      >
        Open your store <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
