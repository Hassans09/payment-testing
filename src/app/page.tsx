import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Tag, Truck } from "lucide-react";

import RevealOnScroll from "@/components/reveal-on-scroll";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ProductCard } from "@/components/product-card";
import { announcement, categories, featuredProducts, products } from "@/lib/store-data";

export default function HomePage() {
  return (
    <>
      {/* Top Announcement Banner */}
      <div className="border-b border-[color:var(--brand-border)] bg-[linear-gradient(90deg,_rgba(196,154,120,0.18),_rgba(216,185,154,0.3),_rgba(196,154,120,0.18))]">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] sm:px-6 lg:px-8 flex items-center justify-center gap-2">
          <span>{announcement}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="overflow-hidden rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_28px_80px_rgba(91,64,50,0.08)]">
          <div className="grid items-stretch lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--brand-deep)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Urban Streetwear & Everyday Luxury</span>
              </span>

              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-5xl lg:text-6xl motion-fade-up">
                Streetwear rebellion. Everyday luxury.
              </h1>

              <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-[color:var(--brand-charcoal)]/80">
                Curated Nigerian marketplace combining urban streetwear with elevated everyday essentials. Featuring 280 GSM heavyweight graphic tees, 450 GSM French terry hoodies, relaxed selvedge denim, and breezy linen co-ords tailored for modern city life.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
                >
                  <span>Explore Catalogue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop?category=hoodies"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50 transition"
                >
                  Streetwear Drops
                </Link>
              </div>

              {/* Nigerian Performance Highlights */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[color:var(--brand-border)]/60 pt-6 text-xs text-[color:var(--brand-charcoal)]/75">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[color:var(--brand-deep)]">₦100k+</div>
                  <div className="text-[11px] font-medium text-[color:var(--brand-charcoal)]/70">Free Express Delivery</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[color:var(--brand-deep)]">450 GSM</div>
                  <div className="text-[11px] font-medium text-[color:var(--brand-charcoal)]/70">Luxury Heavyweight Knit</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[color:var(--brand-deep)]">24–48h</div>
                  <div className="text-[11px] font-medium text-[color:var(--brand-charcoal)]/70">Lagos & Abuja Dispatch</div>
                </div>
              </div>
            </div>

            {/* Visual Hero Editorial Banner */}
            <div className="relative min-h-[420px] lg:min-h-full overflow-hidden bg-[color:var(--brand-ivory)]">
              <Image
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
                alt="Rebel Fashion Nigerian Streetwear Campaign Look"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.55)] via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                      Latest Drop
                    </p>
                    <p className="text-lg font-bold text-[color:var(--brand-deep)]">The Lagos Urban Edit</p>
                    <p className="text-xs text-[color:var(--brand-charcoal)]/70">
                      Unstructured tailoring • Heavyweight archives
                    </p>
                  </div>
                  <Link
                    href="/shop?category=graphic-tees"
                    className="shrink-0 rounded-full bg-[color:var(--brand-deep)] px-4 py-2 text-xs font-bold text-white hover:bg-[color:var(--brand-chocolate)] transition"
                  >
                    View Drop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Pillars */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3.5 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 shadow-2xs">
            <Truck className="h-6 w-6 text-[color:var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[color:var(--brand-deep)]">Fast Dispatch Nationwide</h3>
              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Same-day dispatch in Lagos & Abuja. GIG Logistics courier across all 36 states.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 shadow-2xs">
            <ShieldCheck className="h-6 w-6 text-[color:var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[color:var(--brand-deep)]">Paystack & Bank Transfer</h3>
              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Instant card checkout (Mastercard, Visa, Verve), USSD, or direct Wema Bank transfer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 shadow-2xs">
            <Tag className="h-6 w-6 text-[color:var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[color:var(--brand-deep)]">10% Off First Order</h3>
              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Use checkout promo code <strong className="text-[color:var(--brand-deep)]">REBEL10</strong> for immediate savings.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 shadow-2xs">
            <CheckCircle2 className="h-6 w-6 text-[color:var(--brand-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[color:var(--brand-deep)]">7-Day Fit Guarantee</h3>
              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Hassle-free size exchanges and dedicated WhatsApp customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                Explore by Category
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
                Curated Collections
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
            >
              View Full Index →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-[28px] border border-[color:var(--brand-border)] bg-white shadow-2xs hover:shadow-md transition"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.7)] via-[rgba(28,25,23,0.15)] to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-secondary)]">
                    Atelier Edit
                  </span>
                  <h3 className="mt-1 text-xl font-bold">{category.name}</h3>
                  <p className="mt-1 text-xs text-white/80 line-clamp-2">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Featured Drops Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                Fresh Drop Live
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
                Designed to Wear Now
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
            >
              All Styles ({products.length}) →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Campaign Editorial Feature */}
      <section className="bg-[color:var(--brand-soft)]/45 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 items-center">
          <div className="overflow-hidden rounded-[32px] border border-[color:var(--brand-border)] bg-white shadow-[0_20px_50px_rgba(91,64,50,0.06)]">
            <div className="relative h-[440px]">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt="Rebel Fashion Soft Structure Campaign"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[32px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 sm:p-10 shadow-[0_18px_40px_rgba(91,64,50,0.04)] space-y-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
              Campaign Feature
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
              The Soft Structure Edit.
            </h2>
            <p className="text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
              Precision tailoring meets relaxed textures for a confident wardrobe. Built around timeless staples, heavyweight fabrics, and fluid silhouettes designed to navigate tropical daytime heat through sophisticated Lagos nightlife.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="rounded-full bg-[color:var(--brand-cream)] border border-[color:var(--brand-border)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--brand-deep)]">
                280 GSM Organic Cotton
              </span>
              <span className="rounded-full bg-[color:var(--brand-cream)] border border-[color:var(--brand-border)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--brand-deep)]">
                Tropical Wool Blends
              </span>
              <span className="rounded-full bg-[color:var(--brand-cream)] border border-[color:var(--brand-border)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--brand-deep)]">
                Italian Calfskin Footwear
              </span>
            </div>
            <div className="pt-3">
              <Link
                href="/shop?category=blazers"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
              >
                Shop The Atelier Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                Client Favorites
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
                Trending Across Nigeria
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
            >
              Browse All →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Seasonal Promo Drop Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[linear-gradient(135deg,_rgba(196,154,120,0.22),_rgba(248,243,236,1))] p-8 sm:p-12 lg:p-16">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                  VIP Launch Privilege
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
                  10% Off Your Curated Wardrobe Edit.
                </h2>
                <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[color:var(--brand-charcoal)]/80">
                  Apply discount voucher <strong className="font-extrabold text-[color:var(--brand-deep)]">REBEL10</strong> during checkout to unlock 10% off your entire order with free express courier delivery.
                </p>
              </div>
              <div className="flex justify-start lg:justify-end">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
                >
                  <span>Claim 10% Off & Shop</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <NewsletterSignup />
    </>
  );
}
