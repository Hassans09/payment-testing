"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LoaderCircle, PackageSearch } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { trackOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { OrderStatus, TrackedOrder } from "@/lib/types";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Paid" },
  { status: "processing", label: "Preparing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-base text-[color:var(--brand-charcoal)] outline-none focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/20 sm:text-sm";

/** Guest order lookup: reference + email or phone used at checkout. */
export function OrderTracker({ initialReference = "", initialContact = "" }: { initialReference?: string; initialContact?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [contact, setContact] = useState(initialContact);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);
    if (!reference.trim() || !contact.trim()) return setError("Enter your order reference and the email or phone you used.");
    setBusy(true);
    try {
      const found = await trackOrder(reference.trim(), contact.trim());
      if (!found) setError("We couldn't find an order with those details. Check the reference (it's in your confirmation) and try the email or phone you used at checkout.");
      setOrder(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const stepIndex = order ? STEPS.findIndex((step) => step.status === order.status) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-3xl border border-[color:var(--brand-border)] bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
        <div>
          <label htmlFor="track-ref" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Order reference</label>
          <input id="track-ref" className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. RF-261102-AB12C" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="track-contact" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Email or phone</label>
          <input id="track-contact" className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@example.com or 080…" />
        </div>
        <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-7 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />} Track
        </button>
        {error && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-3">{error}</p>}
      </form>

      {order && (
        <section aria-live="polite" className="rounded-3xl border border-[color:var(--brand-border)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[color:var(--brand-deep)]">Order {order.reference}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">
            Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} · Delivering to {order.city}, {order.state}
          </p>
          {order.status !== "pending" && order.status !== "cancelled" && (
            <ol className="mt-5 grid grid-cols-4 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider">
              {STEPS.map((step, index) => (
                <li key={step.status} className={index <= stepIndex ? "text-[color:var(--brand-deep)]" : "text-[color:var(--brand-charcoal)]/40"}>
                  <span aria-hidden="true" className={`mx-auto mb-1.5 block h-1.5 rounded-full ${index <= stepIndex ? "bg-[color:var(--brand-primary)]" : "bg-[color:var(--brand-border)]"}`} />
                  {step.label}
                  {index === stepIndex && <span className="sr-only"> (current)</span>}
                </li>
              ))}
            </ol>
          )}
          {order.status === "pending" && <p className="mt-4 text-sm text-amber-800">Waiting for the payment to be confirmed.</p>}
          {order.fulfilment.length > 1 && (
            <ul className="mt-4 space-y-1 text-xs text-[color:var(--brand-charcoal)]/75">
              {order.fulfilment.map((part) => (
                <li key={part.sellerName} className="flex items-center justify-between gap-2">
                  <span>From {part.sellerName}</span>
                  <StatusBadge status={part.status} />
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-5 divide-y divide-[color:var(--brand-border)]">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.color}-${item.size}-${item.type ?? ""}`} className="flex items-center gap-3 py-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[color:var(--brand-ivory)]">
                  <SmartImage src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.slug}`} className="block truncate text-sm font-semibold text-[color:var(--brand-deep)] hover:underline">{item.name}</Link>
                  <p className="text-xs text-[color:var(--brand-charcoal)]/60">{[item.type, item.color, item.size, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="text-sm font-bold text-[color:var(--brand-deep)]">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-[color:var(--brand-border)] pt-3 text-sm">
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between font-bold text-[color:var(--brand-deep)]"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}
