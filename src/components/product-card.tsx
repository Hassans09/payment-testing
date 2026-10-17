"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice, type Product } from "@/lib/store-data";

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase();
  if (normalized.includes("caramel") || normalized.includes("tan")) return "#C49A78";
  if (normalized.includes("cocoa") || normalized.includes("chocolate") || normalized.includes("coffee")) return "#5B4032";
  if (normalized.includes("cream") || normalized.includes("ivory") || normalized.includes("oat") || normalized.includes("bone")) return "#F8F3EC";
  if (normalized.includes("black") || normalized.includes("onyx") || normalized.includes("nocturne")) return "#1C1917";
  if (normalized.includes("sand") || normalized.includes("khaki")) return "#D8B99A";
  if (normalized.includes("denim") || normalized.includes("indigo") || normalized.includes("navy")) return "#3A506B";
  if (normalized.includes("terracotta") || normalized.includes("bronze")) return "#A25A38";
  if (normalized.includes("grey") || normalized.includes("ash")) return "#9CA3AF";
  return "#D1C7BD";
}

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist, addToCart } = useStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product,
      color: product.colors[0],
      size: product.sizes[0],
      quantity: 1,
    });
  };

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_12px_35px_rgba(91,64,50,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(91,64,50,0.1)]">
      {/* Visual Image Container */}
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-t-[26px]">
          <div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--brand-ivory)]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.35)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* Badge */}
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--brand-deep)]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-xs backdrop-blur-xs">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={isWishlisted(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-[color:var(--brand-deep)] backdrop-blur-sm transition-transform duration-200 hover:scale-110 hover:bg-white shadow-xs"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted(product.id) ? "fill-red-600 text-red-600" : "text-[color:var(--brand-deep)]"
            }`}
          />
        </button>

        {/* Quick Add Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-md backdrop-blur-md transition hover:bg-[color:var(--brand-primary)] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Information Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Colors swatch */}
          <div className="flex items-center gap-1.5 mb-2">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                title={c}
                className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: getColorHex(c) }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-[color:var(--brand-charcoal)]/50">+{product.colors.length - 4}</span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="text-sm font-semibold text-[color:var(--brand-deep)] transition group-hover/title:text-[color:var(--brand-primary)] line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60 line-clamp-1">
            {product.material.split("(")[0]}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[color:var(--brand-border)]/60 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[color:var(--brand-deep)]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-[color:var(--brand-charcoal)]/50 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-medium text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
