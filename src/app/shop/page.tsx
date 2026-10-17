"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { categories, formatPrice, products } from "@/lib/store-data";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center">Loading catalogue...</div>}>
      <ShopParamsWrapper />
    </Suspense>
  );
}

function ShopParamsWrapper() {
  const params = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "all";
  return <ShopContent key={`${search}:${category}`} initialSearch={search} initialCategory={category} />;
}

function ShopContent({ initialSearch, initialCategory }: { initialSearch: string; initialCategory: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(120000);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      const matchesSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.material.toLowerCase().includes(term);

      return matchesCategory && matchesPrice && matchesSearch;
    });

    switch (sortBy) {
      case "low-to-high":
        return [...nextProducts].sort((a, b) => a.price - b.price);
      case "high-to-low":
        return [...nextProducts].sort((a, b) => b.price - a.price);
      case "newest":
        return [...nextProducts].sort((a, b) => (a.badge ? -1 : 1) - (b.badge ? -1 : 1));
      default:
        return [...nextProducts].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [maxPrice, searchTerm, selectedCategory, sortBy]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const categoryTitle = selectedCategory === "all" ? "All Pieces" : activeCategoryObj?.name ?? "Collection";

  const handleReset = () => {
    setSelectedCategory("all");
    setSearchTerm("");
    setSortBy("featured");
    setMaxPrice(120000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[color:var(--brand-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Nigerian Streetwear & Essentials</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            {categoryTitle}
          </h1>
          {activeCategoryObj && (
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-[color:var(--brand-charcoal)]/75">
              {activeCategoryObj.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
            Showing <strong className="text-[color:var(--brand-deep)] font-bold">{filteredProducts.length}</strong> styles
          </span>
        </div>
      </div>

      {/* Boutique Segmented Category Tabs (Reference: kaystores.vercel.app/gifts) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
              selectedCategory === "all"
                ? "bg-[color:var(--brand-deep)] text-white shadow-sm"
                : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/50"
            }`}
          >
            All Pieces ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                  isSelected
                    ? "bg-[color:var(--brand-deep)] text-white shadow-sm"
                    : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/50"
                }`}
              >
                {cat.name} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="mb-8 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4 sm:p-5 shadow-[0_12px_30px_rgba(91,64,50,0.04)]">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_1fr] items-end">
          {/* Search Box */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Search Styles & Fabrics
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3.5 py-2.5 focus-within:border-[color:var(--brand-primary)]">
              <Search className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search heavyweight, blazer, denim, linen..."
                className="w-full bg-transparent text-xs text-[color:var(--brand-charcoal)] placeholder:text-[color:var(--brand-charcoal)]/45 focus:outline-none"
              />
            </div>
          </div>

          {/* Sort Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Sort By
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3.5 py-2.5">
              <SlidersHorizontal className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[color:var(--brand-charcoal)] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="newest">New Releases & Drops</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
                Max Price Cap
              </label>
              <span className="text-xs font-bold text-[color:var(--brand-deep)]">
                {formatPrice(maxPrice)}
              </span>
            </div>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-2 flex items-center">
              <input
                type="range"
                min="20000"
                max="120000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[color:var(--brand-primary)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Active Filters row */}
        {(selectedCategory !== "all" || searchTerm || maxPrice < 120000 || sortBy !== "featured") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[color:var(--brand-border)]/60">
            <span className="text-xs font-medium text-[color:var(--brand-charcoal)]/60 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Active Filters:
            </span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                {categoryTitle}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                &ldquo;{searchTerm}&rdquo;
              </span>
            )}
            {maxPrice < 120000 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                Up to {formatPrice(maxPrice)}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-12 text-center">
          <h2 className="text-2xl font-bold text-[color:var(--brand-deep)]">No styles match your filters</h2>
          <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70 max-w-md mx-auto">
            Try adjusting your price ceiling, clearing your search query, or selecting another category to view our collection.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* Bottom Inspiration Card */}
      <div className="mt-16 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/40 p-8 sm:p-10 shadow-[0_16px_40px_rgba(91,64,50,0.03)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]/75">
              Nigerian Fashion Identity
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
              Build an effortless capsule wardrobe tailored for the city.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">
              Mix heavyweight 280 GSM graphic tees with unstructured tropical wool blazers and relaxed washed denim for seamless transitions from day to night.
            </p>
          </div>
          <Link
            href="/shop?category=co-ords"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            Explore Matching Sets
          </Link>
        </div>
      </div>
    </div>
  );
}
