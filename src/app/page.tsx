import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import RevealOnScroll from "@/components/reveal-on-scroll";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ProductCard } from "@/components/product-card";
import { categories, featuredProducts, products } from "@/lib/store-data";

export default function HomePage() {
  return (
    <>
      <div className="border-b border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/40">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] sm:px-6 lg:px-8">
          Curated fashion and gifting collections
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="overflow-hidden rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_28px_80px_rgba(91,64,50,0.08)]">
          <div className="grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
              <span className="mb-4 inline-flex w-fit rounded-full border border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--brand-deep)]">
                New Season Edit
              </span>

              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-5xl lg:text-6xl">
                Elevated gifting and everyday style.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
                Discover polished product stories, refined category browsing, and a storefront experience designed to connect cleanly to live inventory and checkout services.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
                >
                  <span>Shop Collections</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop?category=accessories"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50 transition"
                >
                  Gifting Picks
                </Link>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden bg-[color:var(--brand-ivory)] lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury storefront editorial"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.45)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Explore by Category</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">Curated Collections</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]"
            >
              View All →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-[28px] border border-[color:var(--brand-border)] bg-white shadow-2xs transition hover:shadow-md"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.65)] via-[rgba(28,25,23,0.1)] to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-white/80">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Featured Now</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">Selected Products</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]"
            >
              All Products ({products.length}) →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <NewsletterSignup />
    </>
  );
}
