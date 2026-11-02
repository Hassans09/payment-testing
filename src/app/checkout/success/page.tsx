
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Clock, LoaderCircle, MapPin, ShieldCheck, XCircle } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { confirmPayment } from "@/lib/api";
import { readJSON } from "@/lib/client-storage";
import { formatLineOptions, formatPrice } from "@/lib/format";
import type { PaymentConfirmation } from "@/lib/types";

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
    type?: string;
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
    cachedOrder = readJSON<SavedOrder | null>("last_store_order", null, "session");

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
  return (
    <Suspense fallback={<ConfirmingState />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function ConfirmingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 px-4 text-sm text-[color:var(--brand-charcoal)]/70">
      <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--brand-primary)]" /> Confirming your payment…
    </div>
  );
}

type Verification =
  | { state: "checking" }
  | { state: "done"; result: PaymentConfirmation }
  | { state: "error"; message: string };

function CheckoutSuccessContent() {
  const params = useSearchParams();
  // "order" is the current param; "ref" is kept for links created by older versions.
  const ref = params.get("order") ?? params.get("ref") ?? "";
  const transactionRef = params.get("tx") ?? params.get("transactionRef") ?? undefined;

  const sessionOrder = useSyncExternalStore(subscribeOrder, getSessionOrder, getServerOrder);
  const order = sessionOrder && (!ref || sessionOrder.orderId === ref) ? sessionOrder : null;

  const { clearCart } = useStore();
  const [verification, setVerification] = useState<Verification>({ state: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    confirmPayment(ref, transactionRef)
      .then((result) => {
        if (cancelled) return;
        setVerification({ state: "done", result });
        // The bag is emptied only now: kept when the payment failed so the shopper can retry.
        if (result.status !== "failed") clearCart();
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setVerification({
            state: "error",
            message: error instanceof Error ? error.message : "We couldn't check your payment right now.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ref, transactionRef, attempt, clearCart]);

  const status: "checking" | "paid" | "pending" | "failed" | "missing" = !ref
    ? "missing"
    : verification.state === "checking"
      ? "checking"
      : verification.state === "error"
        ? "pending"
        : verification.result.status;

  const serverOrder = verification.state === "done" ? verification.result.order : null;
  const orderId = ref || order?.orderId || null;
  const customerName = order?.customerName ?? serverOrder?.customer.fullName ?? null;
  const address =
    order?.address ??
    (serverOrder ? [serverOrder.customer.address, serverOrder.customer.city, serverOrder.customer.state].filter(Boolean).join(", ") : null);
  const total = serverOrder?.total ?? order?.total ?? null;
  const phone = order?.phone ?? serverOrder?.customer.phone ?? null;
  const paymentMethod = order?.paymentMethod ?? serverOrder?.paymentMethod;
  const items =
    order?.items ??
    serverOrder?.items.map((item) => ({
      id: item.productId,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.image,
      type: item.type,
      color: item.color,
      size: item.size,
    })) ??
    [];

  const paymentMethodLabel =
    paymentMethod === "transfer" ? "Bank transfer (Fairsure)" : paymentMethod === "card" ? "Card (Fairsure)" : "Fairsure";

  const copy = {
    checking: {
      Icon: LoaderCircle,
      badge: "Checking payment",
      title: customerName ? `Thanks, ${customerName.split(" ")[0]}!` : "Thanks for your order!",
      body: "We're confirming your payment with our payment provider. This only takes a moment.",
      statusLine: "Checking payment…",
    },
    paid: {
      Icon: CheckCircle2,
      badge: "Payment confirmed",
      title: customerName ? `Thank you, ${customerName.split(" ")[0]}!` : "Payment confirmed",
      body: "Your payment is confirmed and your order is being prepared. We'll keep you posted by email and phone.",
      statusLine: "Paid",
    },
    pending: {
      Icon: Clock,
      badge: "Awaiting confirmation",
      title: customerName ? `Thanks, ${customerName.split(" ")[0]}!` : "Order received",
      body:
        verification.state === "error"
          ? `${verification.message} Your order is saved. If you were charged, it will be confirmed automatically.`
          : "We haven't received confirmation of your payment yet. If you completed it, it will be confirmed automatically within a few minutes.",
      statusLine: "Awaiting confirmation",
    },
    failed: {
      Icon: XCircle,
      badge: "Payment not completed",
      title: "Your payment didn't go through",
      body: "No order has been confirmed. You can go back to your bag and try again.",
      statusLine: "Not paid",
    },
    missing: {
      Icon: Clock,
      badge: "Checkout status",
      title: "No order to show",
      body: "This page needs an order reference. Return to the shop, or contact support if you need help with an order.",
      statusLine: "Unknown",
    },
  }[status];

  const message = verification.state === "done" ? verification.result.message : undefined;
  const StatusIcon = copy.Icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="space-y-8 rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_20px_55px_rgba(91,64,50,0.06)] sm:p-10">
        {/* Status header */}
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-[color:var(--brand-deep)]">
            <StatusIcon className={`h-8 w-8 ${status === "checking" ? "animate-spin" : ""} ${status === "paid" ? "text-emerald-700" : ""} ${status === "failed" ? "text-red-600" : ""}`} />
          </div>

          <span className="inline-flex max-w-full rounded-full bg-[color:var(--brand-primary)]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            {orderId ? `${copy.badge} • ${orderId}` : copy.badge}
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
            {copy.title}
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75" aria-live="polite">
            {copy.body}
          </p>

          {message && (
            <p className="mx-auto max-w-lg text-xs text-[color:var(--brand-charcoal)]/55">{message}</p>
          )}

          {status === "pending" && (
            <button
              type="button"
              onClick={() => {
                setVerification({ state: "checking" });
                setAttempt((value) => value + 1);
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-6 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50"
            >
              Check again
            </button>
          )}
        </header>

        {/* Order Progress */}
        <section className="space-y-4 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <span>Order Progress</span>
            <span className="flex items-center gap-1 text-[color:var(--brand-charcoal)]/70">
              <Clock className="h-3.5 w-3.5" />
              {copy.statusLine}
            </span>
          </div>

          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 pt-2 sm:grid-cols-[repeat(4,minmax(0,1fr))]">
            {[
              ["1", "Order Received", status === "paid" ? "Paid" : "Pending confirmation"],
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
              {phone ? `Contact phone: ${phone}` : "Contact phone unavailable"}
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
              Payment status: {copy.statusLine}
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
        {items.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Items ({items.length})
            </h2>

            <div className="divide-y divide-[color:var(--brand-border)]/60 border-y border-[color:var(--brand-border)]/60">
              {items.map((item, index) => (
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
                        {formatLineOptions(item)} • Qty {item.quantity}
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
          {status === "failed" && (
            <Link
              href="/cart"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--brand-deep)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]"
            >
              Try payment again
            </Link>
          )}
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
    </div>
  );
}
