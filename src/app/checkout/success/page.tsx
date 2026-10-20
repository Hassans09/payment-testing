
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Clock, MapPin, ShieldCheck } from "lucide-react";

import { formatPrice } from "@/lib/store-data";

type SavedOrder = {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color: string;
    size: string;
  }>;
  date: string;
};

let cachedOrder: SavedOrder | null = null;
let orderInitialized = false;

function getSessionOrder(): SavedOrder | null {
  if (typeof window === "undefined") return null;

  if (!orderInitialized) {
    try {
      const raw = sessionStorage.getItem("last_store_order");
      if (raw) {
        cachedOrder = JSON.parse(raw) as SavedOrder;
      }
    } catch {
      cachedOrder = null;
    }

    orderInitialized = true;
  }

  return cachedOrder;
}

function subscribeOrder() {
  return () => {};
}

function getServerOrder() {
  return null;
}

export default function CheckoutSuccessPage() {
  const order = useSyncExternalStore(
    subscribeOrder,
    getSessionOrder,
    getServerOrder
  );

  const orderId = order?.orderId ?? null;
  const customerName = order?.customerName ?? null;
  const address = order?.address ?? null;
  const total = order?.total ?? null;

  const paymentMethodLabel =
    order?.paymentMethod === "transfer"
      ? "Bank Transfer"
      : order?.paymentMethod === "pod"
        ? "Pay on Delivery"
        : order?.paymentMethod === "card"
          ? "Card Payment"
          : order?.paymentMethod === "fairsurepay"
            ? "FairSurePay"
            : "Payment Method Pending";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8 rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_20px_55px_rgba(91,64,50,0.06)] sm:p-10">
        {/* Pending Status Header */}
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-[color:var(--brand-deep)]">
            <Clock className="h-8 w-8" />
          </div>

          <span className="inline-flex rounded-full bg-[color:var(--brand-primary)]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            {orderId ? `Order Reference • ${orderId}` : "Checkout Status"}
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
            {customerName
              ? `Thank you, ${customerName}!`
              : "Checkout received"}
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">
            {order
              ? "Your checkout details are available in this session. Your order and payment have not been verified by the server yet. Please wait for official confirmation."
              : "No order details were found in this browser session. This page does not confirm that an order was submitted. Return to checkout or contact support if you need assistance."}
          </p>

          {order && (
            <p className="text-sm font-bold text-[color:var(--brand-deep)]">
              Status: Awaiting confirmation
            </p>
          )}
        </header>

        {/* Order Progress */}
        <section className="space-y-4 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <span>Order Progress</span>
            <span className="flex items-center gap-1 text-[color:var(--brand-charcoal)]/70">
              <Clock className="h-3.5 w-3.5" />
              Awaiting confirmation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            {[
              ["1", "Order Received", "Pending confirmation"],
              ["2", "Packaging", "Not started"],
              ["3", "In Transit", "Not started"],
              ["4", "Delivered", "Not started"],
            ].map(([number, title, description]) => (
              <div key={number} className="space-y-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--brand-border)] bg-white text-xs font-bold text-[color:var(--brand-charcoal)]">
                  {number}
                </div>
                <p className="text-xs font-bold text-[color:var(--brand-deep)]">
                  {title}
                </p>
                <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-[color:var(--brand-charcoal)]/65">
            Order tracking will become available when the order-management
            backend is connected.
          </p>
        </section>

        {/* Delivery and Payment Details */}
        <section className="grid gap-6 text-xs sm:grid-cols-2">
          <div className="space-y-1.5 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              <MapPin className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
              Delivery Address
            </span>

            <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
              {address ?? "Address unavailable"}
            </p>

            <p className="text-[color:var(--brand-charcoal)]/65">
              {order?.phone
                ? `Contact phone: ${order.phone}`
                : "Contact phone unavailable"}
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
              Payment Details
            </span>

            <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
              {paymentMethodLabel}
            </p>

            <p className="text-[color:var(--brand-charcoal)]/65">
              Payment status: Not yet verified
            </p>

            <p className="text-[color:var(--brand-charcoal)]/65">
              Order total:{" "}
              <strong className="text-[color:var(--brand-deep)]">
                {total !== null ? formatPrice(total) : "Not available"}
              </strong>
            </p>
          </div>
        </section>

        {/* Purchased Items */}
        {order?.items && order.items.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Checkout Items ({order.items.length})
            </h2>

            <div className="divide-y divide-[color:var(--brand-border)]/60 border-y border-[color:var(--brand-border)]/60">
              {order.items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[color:var(--brand-deep)]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[color:var(--brand-charcoal)]/65">
                        {item.color} • {item.size} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm transition hover:bg-[color:var(--brand-secondary)]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)] transition hover:bg-[color:var(--brand-soft)]/50"
          >
            View Account &amp; Orders
          </Link>
        </nav>
      </div>
    </main>
  );
}
