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
 * Products first: a slim hero, then the mixed product feed straight away (category chips, sort,
 * grid). Categories also live in the header's Shop menu. The seller pitch is a small band lower down.
 */
export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[22px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_20px_60px_rgba(91,64,50,0.07)] sm:rounded-[28px]">
          <div className="grid items-stretch sm:grid-cols-[1.25fr_0.75fr] lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative z-10 flex flex-col justify-center p-4 min-[380px]:p-5 sm:p-7 lg:p-10">
              <span className="mb-2 hidden w-fit rounded-full border border-[color:var(--brand-primary)] sm:inline-flex bg-[color:var(--brand-primary)]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-deep)] sm:mb-3 sm:text-[11px]">
                Clothing · Shoes · Bags · Accessories
              </span>
              <h1 className="max-w-xl text-[1.65rem] font-extrabold leading-[1.1] tracking-tight text-[color:var(--brand-deep)] sm:text-4xl lg:text-5xl">
                Fashion for everyone.
              </h1>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:mt-3 sm:text-sm">
                {SITE_NAME}&apos;s own collection plus approved sellers across Nigeria, delivered nationwide.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)] sm:min-h-12 sm:px-7"
                >
                  <span>Shop all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--brand-deep)]/25 px-5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 sm:min-h-12 sm:px-7"
                >
                  New arrivals
                </Link>
              </div>
            </div>
            {/* The photo only shows from tablet up: on phones the products are the picture. */}
            <div className="relative hidden min-h-[220px] overflow-hidden bg-[color:var(--brand-ivory)] sm:block lg:min-h-[280px]">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                alt="Shoppers browsing a rail of clothing and bags"
                fill
                preload
                sizes="(max-width: 640px) 0px, (max-width: 1024px) 40vw, 30vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.32)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <HomeProducts initial={catalogue} />

      {/* Seller pitch: small, after the products */}
      <section data-reveal className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[22px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--brand-primary)]">
              <Store className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[color:var(--brand-deep)] sm:text-lg">Sell on {SITE_NAME}</h2>
              <p className="mt-0.5 max-w-lg text-sm text-[color:var(--brand-charcoal)]/70">
                Designers, tailors and boutiques: open a free store and keep {100 - PLATFORM_COMMISSION_PERCENT}% of every sale.
              </p>
            </div>
          </div>
          <Link
            href="/sell"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]"
          >
            Start selling <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
