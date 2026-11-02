"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-provider";
import { useAsync } from "@/hooks/use-async";
import { getProducts } from "@/lib/api";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { data: products } = useAsync(() => getProducts(), []);
  const savedProducts = (products ?? []).filter((product) => wishlist.includes(product.id));

  const handleAddAllToCart = () => {
    savedProducts.forEach((p) => {
      addToCart({ product: p, color: p.colors[0]?.name, size: p.sizes[0], quantity: 1 }, false);
    });
  };

  if (savedProducts.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-12 text-center shadow-[0_16px_40px_rgba(91,64,50,0.04)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-soft)]/50 text-red-600">
            <Heart className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Saved Pieces
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Your wishlist is empty
          </h1>
          <p className="mt-2 max-w-md mx-auto text-sm text-[color:var(--brand-charcoal)]/70 leading-relaxed">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            Explore The Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[color:var(--brand-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <Heart className="h-3.5 w-3.5 fill-red-600 text-red-600" />
            <span>Saved Boutique Pieces</span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            My Wishlist ({savedProducts.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add All to Bag</span>
          </button>
          <button
            type="button"
            onClick={() => wishlist.forEach((id) => toggleWishlist(id))}
            className="text-xs font-semibold text-[color:var(--brand-charcoal)]/70 hover:text-red-700 transition"
          >
            Clear Wishlist
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
