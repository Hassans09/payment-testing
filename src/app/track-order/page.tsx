"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { OrderTracker } from "@/components/order-tracker";

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <span className="eyebrow">Orders</span>
      <h1 className="font-display mt-2 text-3xl text-[color:var(--brand-deep)] sm:text-5xl">Track your order</h1>
      <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">Use the reference from your order confirmation and the email or phone you checked out with.</p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <TrackerWithParams />
        </Suspense>
      </div>
    </div>
  );
}

function TrackerWithParams() {
  const params = useSearchParams();
  return <OrderTracker initialReference={params.get("ref") ?? ""} />;
}
