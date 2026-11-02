import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">404</p>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)]">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/70">It may have moved, or the link might be mistyped.</p>
      <Link
        href="/shop"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]"
      >
        Go to the shop
      </Link>
    </div>
  );
}
