"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Something went wrong</p>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)]">This page didn&apos;t load</h1>
      <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/70">
        Please try again. If you were paying, no money is taken twice: check your order on Track order.
      </p>
      {error.digest && <p className="mt-2 text-xs text-[color:var(--brand-charcoal)]/50">Error code: {error.digest}</p>}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]"
        >
          Go to the shop
        </Link>
      </div>
    </div>
  );
}
