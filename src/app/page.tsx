import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

import { HomeProducts } from "@/components/home-products";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";
import { seedProducts } from "@/lib/seed-data";

// Rendered on the server so products are in the first HTML; the feed then refreshes from the
// API, which also includes approved marketplace listings.
const catalogue = seedProducts.filter((product) => product.status === "approved");

/**
 * Products first: a slim hero, then the mixed product feed straight away (one row of category
 * chips + sort, then the grid). The seller pitch is a quiet line lower down.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero: one headline, one line, one button. Slim on phones so products start high. */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-8 lg:px-8">
        <div className="relative overflow-hidden rounded-[22px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_20px_60px_rgba(91,64,50,0.06)] sm:rounded-[28px]">
          <div className="grid items-stretch sm:grid-cols-[1.25fr_0.75fr] lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-4 sm:p-8 lg:p-10">
              <h1 className="max-w-xl font-extrabold leading-[1.15] max-md:text-[1.5rem]! max-md:leading-[1.15]! tracking-tight text-[color:var(--brand-deep)] sm:text-4xl lg:text-5xl">
                Fashion for everyone.
              </h1>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[color:var(--brand-charcoal)]/75 sm:mt-3 sm:text-sm">
                Our own collection and approved sellers, delivered across Nigeria.
              </p>
              <Link
                href="/shop"
                className="mt-3.5 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-6 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)] sm:mt-6 sm:min-h-12 sm:px-7"
              >
                <span>Shop all</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* The photo only shows from tablet up: on phones the products are the picture. */}
            <div className="relative hidden min-h-[220px] overflow-hidden bg-[color:var(--brand-ivory)] sm:block lg:min-h-[260px]">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                alt="Shoppers browsing a rail of clothing and bags"
                fill
                preload
                sizes="(max-width: 640px) 0px, (max-width: 1024px) 40vw, 30vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.28)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <HomeProducts initial={catalogue} />

      {/* Seller pitch: a quiet line after the products, one link. */}
      <section data-reveal className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="flex flex-col items-start gap-4 border-y border-[color:var(--brand-border)] py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 shrink-0 text-[color:var(--brand-primary)]" aria-hidden="true" />
            <p className="text-sm text-[color:var(--brand-charcoal)]/75">
              <span className="font-bold text-[color:var(--brand-deep)]">Sell on {SITE_NAME}.</span>{" "}
              Open a free store and keep {100 - PLATFORM_COMMISSION_PERCENT}% of every sale.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] underline-offset-4 transition hover:text-[color:var(--brand-primary)] hover:underline"
          >
            Start selling <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
