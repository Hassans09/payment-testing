"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/store-data";

const FREE_SHIPPING_THRESHOLD = 100000;

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, subtotal, clearCart } = useStore();

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal === 0 ? 0 : isFreeShipping ? 0 : 3500;
  const estimatedTotal = subtotal + shipping;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-12 text-center shadow-[0_16px_40px_rgba(91,64,50,0.04)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-soft)]/50 text-[color:var(--brand-primary)]">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Shopping Bag
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Your bag is currently empty
          </h1>
          <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/70 max-w-md mx-auto">
            Discover our curated heavyweight graphic tees, relaxed selvedge denim, and elevated Nigerian tailoring.
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
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Rebel Atelier
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Shopping Bag
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-[color:var(--brand-deep)] hover:text-red-700 transition"
        >
          Clear entire bag
        </button>
      </div>

      {/* Free Delivery Banner */}
      <div className="mb-8 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[color:var(--brand-deep)]">
          <Truck className="h-4 w-4 text-[color:var(--brand-primary)] shrink-0" />
          {isFreeShipping ? (
            <span>
              🎉 Congratulations! You have unlocked <strong>Free Express Delivery</strong> across Lagos & Abuja!
            </span>
          ) : (
            <span>
              Add <strong>{formatPrice(remainingForFree)}</strong> more to your bag to enjoy <strong>Free Express Delivery</strong>!
            </span>
          )}
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[color:var(--brand-border)]/60">
          <div
            className="h-full rounded-full bg-[color:var(--brand-primary)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Items List */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 shadow-[0_12px_30px_rgba(91,64,50,0.04)] sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--brand-ivory)] border border-[color:var(--brand-border)]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-base font-bold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[color:var(--brand-charcoal)]/65">
                      Colour: <span className="font-medium text-[color:var(--brand-deep)]">{item.color}</span> • Size:{" "}
                      <span className="font-medium text-[color:var(--brand-deep)]">{item.size}</span>
                    </p>
                  </div>
                  <p className="text-base font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center text-[color:var(--brand-deep)] hover:opacity-75 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-xs font-bold text-[color:var(--brand-deep)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center text-[color:var(--brand-deep)] hover:opacity-75 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Aside */}
        <aside className="rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.04)] h-fit space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Order Summary</h2>

          <div className="space-y-3.5 text-xs text-[color:var(--brand-charcoal)]/80">
            <div className="flex items-center justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[color:var(--brand-deep)]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Nigerian Delivery</span>
              <span className="font-semibold text-[color:var(--brand-deep)]">
                {shipping === 0 ? <span className="text-emerald-700">Free</span> : formatPrice(shipping)}
              </span>
            </div>
            <div className="border-t border-[color:var(--brand-border)] pt-3.5 flex items-center justify-between text-base font-bold text-[color:var(--brand-deep)]">
              <span>Estimated Total</span>
              <span>{formatPrice(estimatedTotal)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="flex w-full items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white py-3 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50 transition"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="rounded-2xl bg-[color:var(--brand-cream)] p-3.5 text-[11px] leading-relaxed text-[color:var(--brand-charcoal)]/70 space-y-1">
            <p>🔒 <strong>Secure Checkout</strong> powered by Paystack.</p>
            <p>📦 <strong>Fast Nationwide Delivery</strong> with real-time GIG tracking.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
