
import Link from "next/link";
import { ArrowLeft, PackageSearch, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
      <section className="w-full rounded-[30px] border border-[color:var(--brand-border)] bg-white p-8 text-center shadow-[0_16px_35px_rgba(91,64,50,0.05)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-cream)]">
          <PackageSearch className="h-8 w-8 text-[color:var(--brand-primary)]" />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
          Rebel Fashion
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
          Order Tracking
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[color:var(--brand-charcoal)]/70">
          Guest order tracking is coming soon. We’re preparing a secure way
          for you to check your order status without creating an account.
        </p>

        <div className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 text-left">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--brand-primary)]" />
          <p className="text-xs leading-6 text-[color:var(--brand-charcoal)]/75">
            Your order details should only be accessible to you through a
            secure verification process.
          </p>
        </div>

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}
