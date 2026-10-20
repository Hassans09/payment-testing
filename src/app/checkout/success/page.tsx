
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CheckCircle2, Clock, MapPin, ShieldCheck } from "lucide-react";

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
        cachedOrder = JSON.parse(raw);
      }
    } catch {
      // Ignore invalid session data.
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
        : order?.paymentMethod === "fairsurepay"
          ? "FairSurePay"
          : "Payment Status Pending";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_20px_55px_rgba(91,64,50,0.06)] space-y-8 sm:p-10">
        {/* Confirmation Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shadow-xs">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <span className="inline-flex rounded-full bg-[color:var(--brand-primary)]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            {orderId ? `Order Reference • ${orderId}` : "Order Status"}
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
            {customerName ? `Thank you, ${customerName}!` : "Checkout Status"}
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">
            {order
              ? "Your checkout details have been recorded. Your order and payment status will be confirmed once verification is complete."
              : "No order details were found for this session. Please return to checkout or contact support if you believe an order was submitted."}
          </p>
        </div>

        {/* Order Progress Preview */}
        <div className="rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <span>Order Progress Preview</span>
            <span className="flex items-center gap-1 text-[color:var(--brand-primary)]">
              <Clock className="h-3.5 w-3.5" />
              <span>Tracking Coming Soon</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <div className="space-y-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--brand-border)] bg-white text-xs font-bold text-[color:var(--brand-charcoal)]">
                1
              </div>
              <p className="text-xs font-bold text-[color:var(--brand-deep)]">Order Placed</p>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">Awaiting confirmation</p>
            </div>

            <div className="space-y-1.5 opacity-70">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--brand-border)] bg-white text-xs font-bold text-[color:var(--brand-charcoal)]">
                2
              </div>
              <p className="text-xs font-bold text-[color:var(--brand-deep)]">Packaging</p>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">Not started</p>
            </div>

            <div className="space-y-1.5 opacity-60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--brand-border)] bg-white text-xs font-bold text-[color:var(--brand-charcoal)]">
                3
              </div>
              <p className="text-xs font-bold text-[color:var(--brand-deep)]">In Transit</p>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">Not started</p>
            </div>

            <div className="space-y-1.5 opacity-60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--brand-border)] bg-white text-xs font-bold text-[color:var(--brand-charcoal)]">
                4
              </div>
              <p className="text-xs font-bold text-[color:var(--brand-deep)]">Delivered</p>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">Not started</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid gap-6 text-xs sm:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4 space-y-1.5">
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

          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4 space-y-1.5">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
              Payment Details
            </span>

            <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
              {paymentMethodLabel}
            </p>

            <p className="text-[color:var(--brand-charcoal)]/65">
              Payment status: Awaiting verification
            </p>

            <p className="text-[color:var(--brand-charcoal)]/65">
              Order Total:{" "}
              <strong className="text-[color:var(--brand-deep)]">
                {total !== null ? formatPrice(total) : "Not available"}
              </strong>
            </p>
          </div>
        </div>

        {/* Purchased Items */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Purchased Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[color:var(--brand-border)]/60 border-y border-[color:var(--brand-border)]/60">
              {order.items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[color:var(--brand-deep)]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[color:var(--brand-charcoal)]/65">
                        {item.color} • {item.size} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
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
        </div>
      </div>
    </div>
  );
}
