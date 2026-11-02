"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, LoaderCircle, PackageSearch } from "lucide-react";

import { OrderTracker } from "@/components/order-tracker";
import { StatusBadge } from "@/components/status-badge";
import { trackOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { readMyOrders } from "@/lib/my-orders";
import type { TrackedOrder } from "@/lib/types";

/**
 * Guest "account": the orders placed in this browser (no sign-up needed) plus order tracking.
 * With a real backend, signed-in shoppers would load GET /me/orders here (see BACKEND.md).
 */
export default function AccountPage() {
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refs = readMyOrders();
    Promise.all(refs.map((ref) => trackOrder(ref.reference, ref.contact).catch(() => null))).then((found) => {
      if (!cancelled) setOrders(found.filter((order): order is TrackedOrder => Boolean(order)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <span className="eyebrow">Account</span>
      <h1 className="font-display mt-2 text-3xl text-[color:var(--brand-deep)] sm:text-5xl">Your orders</h1>
      <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">Orders placed on this device. No account needed.</p>

      <section aria-label="Orders on this device" className="mt-6">
        {orders === null ? (
          <div className="flex justify-center py-8"><LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--brand-primary)]" /></div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--brand-border)] bg-white p-6 text-center text-sm text-[color:var(--brand-charcoal)]/70">
            <PackageSearch className="mx-auto h-7 w-7 text-[color:var(--brand-primary)]" />
            <p className="mt-2">No orders on this device yet. Ordered on another phone? Track it below.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--brand-border)] rounded-3xl border border-[color:var(--brand-border)] bg-white">
            {orders.map((order) => (
              <li key={order.reference}>
                <Link href={`/track-order?ref=${encodeURIComponent(order.reference)}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-[color:var(--brand-cream)]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[color:var(--brand-deep)]">{order.reference}</p>
                    <p className="text-xs text-[color:var(--brand-charcoal)]/60">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {order.items.length} item{order.items.length === 1 ? "" : "s"} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--brand-charcoal)]/40" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="track-title" className="mt-10">
        <h2 id="track-title" className="mb-3 text-lg font-bold text-[color:var(--brand-deep)]">Track another order</h2>
        <OrderTracker />
      </section>

      <p className="mt-10 text-xs text-[color:var(--brand-charcoal)]/65">
        Selling clothes?{" "}
        <Link href="/seller/login" className="font-semibold text-[color:var(--brand-deep)] underline">Seller login</Link>
        {" · "}
        <Link href="/sell" className="font-semibold text-[color:var(--brand-deep)] underline">Open a store</Link>
      </p>
    </div>
  );
}
