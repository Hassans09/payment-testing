"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Store } from "lucide-react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { SmartImage } from "@/components/smart-image";
import { useAsync } from "@/hooks/use-async";
import { getProducts, getSellerProfile } from "@/lib/api";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/product-sort";

/** /sellers/[id]: a seller's profile (name, logo, bio) and their live products. */
export function SellerStorefront({ sellerId }: { sellerId: string }) {
  const profile = useAsync(() => getSellerProfile(sellerId), [sellerId]);
  const products = useAsync(() => getProducts({ sellerId }), [sellerId]);
  const [sort, setSort] = useState<SortKey>("newest");
  const sorted = useMemo(() => sortProducts(products.data ?? [], sort), [products.data, sort]);

  if (!profile.loading && !profile.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[color:var(--brand-deep)]">Store not found</h1>
        <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">This store isn&apos;t open right now.</p>
        <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[color:var(--brand-primary)] px-7 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
          Browse all products
        </Link>
      </div>
    );
  }

  const seller = profile.data;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-5 flex items-center gap-4 border-b border-[color:var(--brand-border)] pb-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] sm:h-20 sm:w-20">
          {seller?.logo ? (
            <SmartImage src={seller.logo} alt={`${seller.businessName} logo`} fill sizes="80px" className="object-cover" />
          ) : (
            <Store className="h-7 w-7 text-[color:var(--brand-primary)]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <span className="eyebrow">Store</span>
          <h1 className="font-display text-3xl text-[color:var(--brand-deep)] sm:text-4xl">{seller?.businessName ?? "…"}</h1>
          {seller?.bio && <p className="mt-1 max-w-2xl text-sm text-[color:var(--brand-charcoal)]/75">{seller.bio}</p>}
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60" aria-live="polite">
          <strong className="font-bold text-[color:var(--brand-deep)]">{sorted.length}</strong> items
        </span>
        <label htmlFor="store-sort" className="flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white pl-3.5 pr-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Sort</span>
          <select id="store-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="min-h-10 cursor-pointer bg-transparent text-base font-semibold text-[color:var(--brand-deep)] focus:outline-none sm:text-sm">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {products.loading && !products.data ? (
        <ProductGridSkeleton count={4} />
      ) : sorted.length > 0 ? (
        <ProductGrid products={sorted} eagerCount={4} />
      ) : (
        <p className="rounded-3xl border border-dashed border-[color:var(--brand-border)] bg-white p-8 text-center text-sm text-[color:var(--brand-charcoal)]/70">
          No products live in this store right now.
        </p>
      )}
    </div>
  );
}
