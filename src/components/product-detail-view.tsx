"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Heart, ShieldCheck, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { initialSelection, missingSelection, ProductOptions, type ProductSelection } from "@/components/product-options";
import { SmartImage } from "@/components/smart-image";
import { useStore } from "@/components/store-provider";
import { useAsync } from "@/hooks/use-async";
import { getProducts } from "@/lib/api";
import { PLATFORM_SELLER_ID, categoryName } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetailView({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selection, setSelection] = useState<ProductSelection>(() => initialSelection(product));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const isMarketplace = product.sellerId !== PLATFORM_SELLER_ID;
  const colorVariant = product.colors.find((color) => color.name === selection.color);
  const genderLabel = product.gender === "kids" ? "Kids" : product.gender === "women" ? "Women" : product.gender === "men" ? "Men" : "Unisex";

  // Photos for the selected colour first, then the general product photos.
  const gallery = useMemo(() => {
    const colourPhotos = colorVariant?.images?.length
      ? colorVariant.images
      : colorVariant?.image
        ? [colorVariant.image]
        : [];
    const merged = [...colourPhotos, ...product.images];
    return merged.filter((image, index) => merged.indexOf(image) === index);
  }, [colorVariant, product.images]);

  const { data: allProducts } = useAsync(() => getProducts(), []);
  const relatedProducts = useMemo(() => {
    const others = (allProducts ?? []).filter((item) => item.id !== product.id);
    const sameGender = others.filter((item) => item.gender === product.gender);
    const rest = others.filter((item) => item.gender !== product.gender);
    return [...sameGender, ...rest].slice(0, 4);
  }, [allProducts, product.id, product.gender]);

  const handleAddToBag = () => {
    const missing = missingSelection(product, selection);
    if (missing) {
      setError(missing);
      return;
    }

    setError("");
    addToCart(
      { product, type: selection.type, color: selection.color, size: selection.size, quantity },
      true // open drawer
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
        <Link href="/" className="hover:text-[color:var(--brand-deep)]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[color:var(--brand-deep)]">Shop</Link>
        <span>/</span>
        <Link href={`/shop?gender=${product.gender === "unisex" ? "all" : product.gender}`} className="hover:text-[color:var(--brand-deep)]">
          {genderLabel}
        </Link>
        <span>/</span>
        <span className="text-[color:var(--brand-deep)] truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* Product Imagery Gallery */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)] shadow-[0_16px_45px_rgba(91,64,50,0.06)]">
            <div className="relative aspect-[3/4] w-full">
              <SmartImage
                src={gallery[activeImageIndex] || gallery[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-top transition-opacity duration-300"
              />
            </div>

            {product.badge && (
              <span className="absolute left-5 top-5 rounded-full bg-[color:var(--brand-deep)]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    activeImageIndex === index
                      ? "border-[color:var(--brand-deep)] ring-2 ring-[color:var(--brand-primary)]/40"
                      : "border-[color:var(--brand-border)] hover:border-[color:var(--brand-primary)]"
                  }`}
                >
                  <SmartImage
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                {[categoryName(product.category), product.productType].filter(Boolean).join(" · ")} · {genderLabel}
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center gap-1.5 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[color:var(--brand-deep)] hover:bg-[color:var(--brand-soft)]/50 transition"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted(product.id) ? "fill-red-600 text-red-600" : "text-[color:var(--brand-deep)]"
                  }`}
                />
                <span>{isWishlisted(product.id) ? "Saved" : "Save"}</span>
              </button>
            </div>

            <h1 className="font-display text-3xl text-[color:var(--brand-deep)] sm:text-5xl">
              {product.name}
            </h1>

            <p className="flex items-center gap-1.5 text-sm text-[color:var(--brand-charcoal)]/75">
              <Store className="h-4 w-4 text-[color:var(--brand-primary)]" />
              Sold by <span className="font-semibold text-[color:var(--brand-deep)]">{product.sellerName}</span>
              {isMarketplace && (
                <span className="ml-1 rounded-full bg-[color:var(--brand-soft)]/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
                  Marketplace seller
                </span>
              )}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[color:var(--brand-deep)]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-[color:var(--brand-charcoal)]/50 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.stock > 0 ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {product.stock <= 5 ? `Only ${product.stock} left` : "In Stock"}
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Sold out</span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Type, colour and size */}
          <ProductOptions
            product={product}
            value={selection}
            onChange={(next) => {
              if (next.color !== selection.color) setActiveImageIndex(0);
              setSelection(next);
              setError("");
            }}
            idPrefix="pdp"
          />
          {colorVariant && !colorVariant.image && product.colors.length > 1 && (
            <p className="-mt-4 text-[11px] text-[color:var(--brand-charcoal)]/55">Photo shows {product.colors[0]?.name}; you&apos;ll receive {colorVariant.name}.</p>
          )}

          {/* Quantity and Add to Bag */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Stepper */}
              <div className="flex h-12 items-center justify-between rounded-full border border-[color:var(--brand-border)] bg-white px-3 shadow-2xs sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center text-lg text-[color:var(--brand-deep)] hover:opacity-70 transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="font-semibold text-sm text-[color:var(--brand-deep)]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="flex h-8 w-8 items-center justify-center text-lg text-[color:var(--brand-deep)] hover:opacity-70 transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={product.stock <= 0}
                className="disabled:cursor-not-allowed disabled:opacity-50 flex flex-1 h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition active:scale-[0.99]"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag • {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 space-y-2.5 text-xs text-[color:var(--brand-charcoal)]/85">
            <div className="flex items-center gap-2 font-semibold text-[color:var(--brand-deep)]">
              <Truck className="h-4 w-4 text-[color:var(--brand-primary)]" />
              <span>Order Fulfillment</span>
            </div>
            <p className="leading-relaxed pl-6">
              Estimated processing and shipping methods are finalized during checkout based on your delivery destination.
            </p>
            <div className="flex items-center gap-2 pl-6 pt-1 text-[11px] text-[color:var(--brand-charcoal)]/70">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
              <span>Secure checkout and order confirmation included</span>
            </div>
          </div>

          {/* Detailed Craftsmanship & Material Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-3.5">
              <span className="font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Fabric Spec</span>
              <p className="mt-1 text-[color:var(--brand-charcoal)]/75">{product.material}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-3.5">
              <span className="font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Cut & Fit</span>
              <p className="mt-1 text-[color:var(--brand-charcoal)]/75">{product.fit}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-3.5">
              <span className="font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Garment Care</span>
              <p className="mt-1 text-[color:var(--brand-charcoal)]/75">{product.care}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-3.5">
              <span className="font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Sold &amp; shipped by</span>
              <p className="mt-1 text-[color:var(--brand-charcoal)]/75">{product.sellerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Cross-Sell Products */}
      <div className="mt-24 border-t border-[color:var(--brand-border)] pt-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Style Curation</span>
            </div>
            <h2 className="font-display mt-1 text-2xl text-[color:var(--brand-deep)] sm:text-4xl">
              You may also like
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)]"
          >
            Shop all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
