"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Plus, SlidersHorizontal, Store } from "lucide-react";

import { QuickAddSheet } from "@/components/quick-add-sheet";
import { SmartImage } from "@/components/smart-image";
import { useStore } from "@/components/store-provider";
import { PLATFORM_SELLER_ID } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { isWishlisted, toggleWishlist } = useStore();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const hoverImage = product.images[1] ?? product.colors[1]?.image;
  const isMarketplace = product.sellerId !== PLATFORM_SELLER_ID;

  const openOptions = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOptionsOpen(true);
  };

  return (
    <article
      // First-row cards are marked revealed from the server render, so they are never hidden
      // waiting for the scroll-reveal script (see src/components/scroll-reveal.tsx).
      data-revealed={eager ? "" : undefined}
      className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[18px] border sm:rounded-[26px] border-[color:var(--brand-border)] bg-white shadow-[0_12px_35px_rgba(91,64,50,0.06)] motion-card-float"
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="block overflow-hidden rounded-t-[18px] sm:rounded-t-[26px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--brand-ivory)]">
            <SmartImage
              src={product.images[0]}
              alt={product.name}
              fill
              loading={eager ? "eager" : undefined}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-top transition duration-700 ease-out group-hover:scale-105 ${hoverImage ? "group-hover:opacity-0" : ""}`}
            />
            {hoverImage && (
              <SmartImage
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top opacity-0 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.35)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* Only the label a shopper needs before tapping: sold out. */}
        {product.stock <= 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[color:var(--brand-deep)]/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:py-1">
            Sold out
          </span>
        )}

        <button
          type="button"
          aria-label={
            isWishlisted(product.id)
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[color:var(--brand-deep)] sm:right-3 sm:top-3"
        >
          <Heart
            className={`h-4 w-4 ${
              isWishlisted(product.id) ? "fill-red-600 text-red-600" : ""
            }`}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 hidden opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 lg:block">
          <button
            type="button"
            onClick={openOptions}
            disabled={product.stock <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-ivory)] active:scale-[0.98] disabled:opacity-60"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {product.stock <= 0 ? "Sold out" : "Choose options"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <div>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)] sm:text-sm">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[color:var(--brand-charcoal)]/60 sm:text-xs">
            {isMarketplace && <Store className="h-3 w-3 shrink-0 text-[color:var(--brand-primary)]" aria-hidden="true" />}
            <span className="truncate">Sold by {product.sellerName}</span>
          </p>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="text-sm font-bold text-[color:var(--brand-deep)] sm:text-base">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="hidden text-xs text-[color:var(--brand-charcoal)]/45 line-through xl:inline">{formatPrice(product.compareAtPrice)}</span>
            )}
          </span>

          <button
            type="button"
            onClick={openOptions}
            disabled={product.stock <= 0}
            aria-label={`Choose options and add ${product.name} to bag`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-border)] text-[color:var(--brand-deep)] transition hover:border-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary)] disabled:opacity-40 lg:h-9 lg:w-9"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {optionsOpen && <QuickAddSheet product={product} onClose={() => setOptionsOpen(false)} />}
    </article>
  );
}

/** Product grid: 2 columns on phones, 3 on tablets, 4 (max) from laptops up. */
export const PRODUCT_GRID_CLASS =
  "grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-x-6 lg:gap-y-10";

/** A grid of product cards that float in, slightly staggered, as they scroll into view. */
export function ProductGrid({ products, eagerCount = 0 }: { products: Product[]; eagerCount?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASS} data-reveal-stagger>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={index < eagerCount} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASS}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-[18px] border sm:rounded-[26px] border-[color:var(--brand-border)] bg-white">
          <div className="aspect-[3/4] bg-[color:var(--brand-ivory)]" />
          <div className="space-y-2 p-5">
            <div className="h-3 w-2/3 rounded bg-[color:var(--brand-ivory)]" />
            <div className="h-3 w-1/3 rounded bg-[color:var(--brand-ivory)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
