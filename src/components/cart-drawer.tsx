"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatLineOptions, formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isCartOpen, closeCart, cart, subtotal, updateCartQuantity, removeFromCart } = useStore();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md bg-[color:var(--brand-white)] shadow-2xl flex flex-col justify-between border-l border-[color:var(--brand-border)]">
          {/* Header */}
          <div className="border-b border-[color:var(--brand-border)] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[color:var(--brand-primary)]" />
                <h2 className="text-xl font-semibold tracking-tight text-[color:var(--brand-deep)]">
                  Your Bag
                </h2>
                <span className="rounded-full bg-[color:var(--brand-soft)]/60 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--brand-deep)]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-[color:var(--brand-charcoal)]/70 hover:bg-[color:var(--brand-soft)]/50 hover:text-[color:var(--brand-deep)] transition"
                aria-label="Close cart drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-3 text-xs text-[color:var(--brand-charcoal)]/75">
              Shipping methods and totals are calculated during checkout.
            </div>
          </div>

          {/* Body / Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-soft)]/50 text-[color:var(--brand-primary)]">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--brand-deep)]">
                  Your bag is currently empty
                </h3>
                <p className="mt-2 max-w-xs text-sm text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                  Discover our curated heavyweight tees, relaxed denim, and streetwear tailoring.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-[color:var(--brand-border)]/60">
                {cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--brand-ivory)] border border-[color:var(--brand-border)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] line-clamp-1 transition"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-[color:var(--brand-charcoal)]/50 hover:text-red-700 transition p-1"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">
                          {formatLineOptions(item)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center text-[color:var(--brand-deep)] hover:opacity-75 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-semibold text-[color:var(--brand-deep)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center text-[color:var(--brand-deep)] hover:opacity-75 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="border-t border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 px-6 py-5 space-y-3">
              <div className="flex items-center justify-between text-base font-semibold text-[color:var(--brand-deep)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/65 leading-tight">
                Shipping and discounts are calculated at checkout.
              </p>

              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] py-3 text-sm font-semibold text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center justify-between text-xs pt-1">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="font-medium text-[color:var(--brand-deep)] hover:underline"
                  >
                    View full cart page
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="text-[color:var(--brand-charcoal)]/75 hover:text-[color:var(--brand-deep)]"
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
