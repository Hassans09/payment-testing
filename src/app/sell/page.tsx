import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Banknote, BadgeCheck, Camera, Percent, ShieldCheck, Store, Truck, UserPlus } from "lucide-react";

import { Marquee } from "@/components/marquee";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { KAFTAN_FEATURE_IMAGES } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Sell with us",
  description: `Open a fashion store on ${SITE_NAME}: list clothing, shoes, bags and accessories. ${PLATFORM_COMMISSION_PERCENT}% commission, payouts straight to your bank account.`,
};

const EXAMPLE_PRICE = 100000;
const exampleCommission = Math.round((EXAMPLE_PRICE * PLATFORM_COMMISSION_PERCENT) / 100);

const steps = [
  { icon: UserPlus, title: "Create your seller account", body: "Tell us your business name and the bank account you want to be paid into. It takes two minutes." },
  { icon: Camera, title: "List your pieces", body: "Upload photos, add colours, sizes, price and stock. Every listing is reviewed by our team." },
  { icon: BadgeCheck, title: "Go live", body: "Once approved, your products appear in the shop and on the homepage with \u201cSold by\u201d your store name." },
  { icon: Banknote, title: "Get paid directly", body: `When a customer pays, we record your ${100 - PLATFORM_COMMISSION_PERCENT}% share and pay it out to your own bank account.` },
];

const faqs = [
  { q: "How much does it cost?", a: `Opening a store is free. We take ${PLATFORM_COMMISSION_PERCENT}% of each item you sell — nothing else.` },
  { q: "When do I get my money?", a: `Customers pay securely through Fairsure. We record your ${100 - PLATFORM_COMMISSION_PERCENT}% share on every order and pay it out to your own bank account after the order is confirmed.` },
  { q: "What can I sell?", a: "Any clothing, shoes, bags or accessories: shirts, T-shirts, hoodies, jeans, dresses, native wear, kids' wear, sneakers, sandals, handbags, caps, jewellery and more. Pick the category, then add your sizes and colours." },
  { q: "Who handles delivery?", a: "You prepare and ship your orders. You'll see every order and the customer's delivery details in your seller dashboard." },
];

export default function SellPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow">Sell on {SITE_NAME}</span>
            <h1 className="font-display mt-4 text-5xl leading-[0.95] text-[color:var(--brand-deep)] sm:text-7xl">
              Your fashion. <em className="text-[color:var(--brand-primary)]">Our runway.</em>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
              Sell clothing, shoes, bags and accessories on {SITE_NAME}. Reach shoppers nationwide, keep {100 - PLATFORM_COMMISSION_PERCENT}% of every sale and get paid straight to your own bank account.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/seller/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]">
                Create seller account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/seller/login" className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-deep)]/25 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50">
                Seller login
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-[color:var(--brand-border)]">
            <Image src={KAFTAN_FEATURE_IMAGES.women} alt="A piece listed on the store" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top" />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6">
              <p className="flex items-center gap-2 text-xs font-semibold text-[color:var(--brand-deep)]">
                <Store className="h-4 w-4 text-[color:var(--brand-primary)]" /> Sold by Your Store Name
              </p>
              <p className="mt-1 text-[11px] text-[color:var(--brand-charcoal)]/70">Your store name appears on every product you list.</p>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={["0 setup fees", `${PLATFORM_COMMISSION_PERCENT}% commission only`, "Paid to your bank", "Nationwide shoppers", "Every listing reviewed"]} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="eyebrow">How it works</span>
        <h2 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">Four steps to your first sale</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <div key={title} className="rounded-3xl border border-[color:var(--brand-border)] bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl text-[color:var(--brand-soft)]">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-[color:var(--brand-deep)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--brand-ink)] text-[color:var(--brand-soft)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="eyebrow">Simple, fair pricing</span>
            <h2 className="font-display mt-3 text-4xl text-white sm:text-6xl">{PLATFORM_COMMISSION_PERCENT}% commission.<br />That&apos;s it.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[color:var(--brand-soft)]/80">
              No listing fees, no monthly subscription. We only earn when you do, and your share is paid out to your own bank account.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                { icon: Percent, text: `${PLATFORM_COMMISSION_PERCENT}% per item sold, worked out automatically on every order` },
                { icon: Banknote, text: "Your share is paid out to your own bank account" },
                { icon: ShieldCheck, text: "Secure card and bank transfer payments" },
                { icon: Truck, text: "Order and delivery details in your dashboard" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-primary)]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Example sale</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <dt>Customer pays for your item</dt>
                <dd className="font-display text-2xl text-white">{formatPrice(EXAMPLE_PRICE)}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <dt>{SITE_NAME} commission ({PLATFORM_COMMISSION_PERCENT}%)</dt>
                <dd className="font-display text-2xl text-white/70">− {formatPrice(exampleCommission)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-white">Paid to your bank account</dt>
                <dd className="font-display text-3xl text-[color:var(--brand-primary)]">{formatPrice(EXAMPLE_PRICE - exampleCommission)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-[11px] text-[color:var(--brand-soft)]/60">Delivery fees are charged to the customer separately. Card and transfer payments are processed by Fairsure.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-center text-4xl text-[color:var(--brand-deep)]">Questions sellers ask</h2>
        <div className="mt-8 divide-y divide-[color:var(--brand-border)] rounded-3xl border border-[color:var(--brand-border)] bg-white">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[color:var(--brand-deep)]">
                {faq.q}
                <span className="text-lg text-[color:var(--brand-primary)] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">{faq.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/seller/signup" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]">
            Open your store <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
