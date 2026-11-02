import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

import { NewsletterSignup } from "@/components/newsletter-signup";
import { ProductRail } from "@/components/product-rail";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";
import { KAFTAN_FEATURE_IMAGES, seedProducts } from "@/lib/seed-data";

// Rendered on the server so the page is never empty; the rails then refresh
// from the API (which also includes approved marketplace listings).
const catalogue = seedProducts.filter((product) => product.status === "approved");

const kaftanPanels = [
  { label: "For Him", sub: "Linen, thobes & jalabiyas", href: "/category/kaftans?gender=men", image: KAFTAN_FEATURE_IMAGES.men },
  { label: "For Her", sub: "Abaya, kimono & Moroccan-style", href: "/category/kaftans?gender=women", image: KAFTAN_FEATURE_IMAGES.women },
  { label: "For Kids", sub: "Little pieces for big days", href: "/category/kaftans?gender=kids", image: KAFTAN_FEATURE_IMAGES.kids },
];

const sectionHeading = "mt-1 text-[1.65rem] font-extrabold leading-tight tracking-tight text-[color:var(--brand-deep)] sm:text-4xl";
const eyebrow = "text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]";
const textLink =
  "inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16">
        <div className="relative overflow-hidden rounded-[24px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_28px_80px_rgba(91,64,50,0.08)] sm:rounded-[32px]">
          <div className="grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 flex flex-col justify-center p-5 min-[380px]:p-6 sm:p-10 lg:p-14 xl:p-16">
              <span className="mb-4 inline-flex w-fit rounded-full border border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-deep)] sm:text-xs">
                Clothing · Shoes · Bags · Accessories
              </span>
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-5xl lg:text-6xl">
                Fashion for everyone.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
                Shop {SITE_NAME}&apos;s own collection and pieces from approved independent sellers across Nigeria: everyday
                wear, occasion outfits, shoes, bags and accessories, delivered nationwide.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]"
                >
                  <span>Shop all products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--brand-deep)]/25 px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50"
                >
                  <Store className="h-4 w-4" /> Sell with us
                </Link>
              </div>
            </div>
            <div className="relative min-h-[260px] overflow-hidden bg-[color:var(--brand-ivory)] sm:min-h-[420px] lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
                alt="Shoppers browsing a rail of clothing and bags"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.42)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Rebel Fashion's own collection: kaftans for now */}
      <section id="our-collection" data-reveal className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <span className={eyebrow}>{SITE_NAME}&apos;s own collection</span>
            <h2 className={sectionHeading}>
              Kaftans <span className="text-[color:var(--brand-primary)]">· more coming soon</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--brand-charcoal)]/75">
              Our house label starts with modern kaftans in linen, cotton and crepe for men, women and kids. New categories
              from us are on the way.
            </p>
          </div>
          <Link href="/category/kaftans" className={textLink}>
            Shop our kaftans →
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3" data-reveal-stagger>
          {kaftanPanels.map((panel) => (
            <Link
              key={panel.label}
              href={panel.href}
              className="group relative aspect-[16/11] overflow-hidden rounded-[22px] bg-[color:var(--brand-ivory)] sm:aspect-[4/5] sm:rounded-[28px]"
            >
              <Image
                src={panel.image}
                alt={`${SITE_NAME} kaftans ${panel.label.toLowerCase()}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,13,0.65)] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                <div className="min-w-0">
                  <h3 className="text-xl font-extrabold text-white sm:text-2xl">{panel.label}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/80 sm:text-xs">{panel.sub}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-[color:var(--brand-deep)] transition group-hover:bg-[color:var(--brand-primary)]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Marketplace: approved seller products */}
      <section id="from-our-sellers" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div data-reveal className="mb-6 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <span className={eyebrow}>Marketplace</span>
            <h2 className={sectionHeading}>From our sellers</h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--brand-charcoal)]/75">
              Clothing, shoes, bags and accessories from independent designers, tailors and boutiques, every listing reviewed
              by our team.
            </p>
          </div>
          <Link href="/shop?sold=marketplace" className={textLink}>
            Browse the marketplace →
          </Link>
        </div>
        <ProductRail
          limit={8}
          mode="newest"
          source="marketplace"
          emptyState={
            <div
              data-reveal
              className="flex flex-col items-start gap-5 rounded-[24px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-primary)]">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[color:var(--brand-deep)]">Our first sellers are setting up shop</h3>
                  <p className="mt-1 max-w-lg text-sm text-[color:var(--brand-charcoal)]/70">
                    Make or sell clothes, shoes, bags or accessories? Open a free store, keep {100 - PLATFORM_COMMISSION_PERCENT}% of
                    every sale and be one of the first brands shoppers see here.
                  </p>
                </div>
              </div>
              <Link
                href="/seller/signup"
                className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-7 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)] sm:w-auto"
              >
                Start selling <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div data-reveal className="mb-6 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <span className={eyebrow}>Featured now</span>
            <h2 className={sectionHeading}>Selected products</h2>
          </div>
          <Link href="/shop" className={textLink}>
            View all →
          </Link>
        </div>
        <ProductRail initial={catalogue} limit={8} mode="featured" />
      </section>

      <NewsletterSignup />
    </>
  );
}
