"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Heart, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-provider";
import { formatPrice, getRelatedProducts, type Product } from "@/lib/store-data";

export function ProductDetailView({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const relatedProducts = getRelatedProducts(product.id);

  const handleAddToBag = () => {
    if (product.colors.length > 0 && !selectedColor) {
      setError("Please select a colour before adding this item to your bag.");
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size before adding this item to your bag.");
      return;
    }

    setError("");
    addToCart(
      { product, color: selectedColor, size: selectedSize, quantity },
      true // open drawer
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
        <Link href="/" className="hover:text-[color:var(--brand-deep)]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[color:var(--brand-deep)]">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-[color:var(--brand-deep)] capitalize">
          {product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-[color:var(--brand-deep)] truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* Product Imagery Gallery */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)] shadow-[0_16px_45px_rgba(91,64,50,0.06)]">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-opacity duration-300"
              />
            </div>

            {product.badge && (
              <span className="absolute left-5 top-5 rounded-full bg-[color:var(--brand-deep)]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
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
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
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
                Curated Selection
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

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--brand-deep)]">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[color:var(--brand-deep)]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-[color:var(--brand-charcoal)]/50 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">In Stock</span>
            </div>

            <p className="text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-[color:var(--brand-deep)]">
                <span>Selected Colour:</span>
                <span className="text-[color:var(--brand-charcoal)]/75">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[color:var(--brand-deep)] text-white shadow-sm"
                          : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-[color:var(--brand-deep)]">
                <span>Select Size:</span>
                <span className="text-[color:var(--brand-primary)] font-medium cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-11 min-w-12 items-center justify-center rounded-2xl px-3 text-xs font-bold transition ${
                        isSelected
                          ? "bg-[color:var(--brand-primary)] text-[color:var(--brand-deep)] ring-2 ring-[color:var(--brand-deep)]/20 shadow-sm"
                          : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)] hover:border-[color:var(--brand-primary)]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
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
                className="flex flex-1 h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition active:scale-[0.99]"
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
              <span className="font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Fulfillment</span>
              <p className="mt-1 text-[color:var(--brand-charcoal)]/75">{product.shipping}</p>
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
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--brand-deep)]">
              Complete the Look
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)]"
          >
            Explore All →
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
