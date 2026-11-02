import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage } from "@/components/info-page";
import { PLATFORM_COMMISSION_PERCENT, RETURN_WINDOW_DAYS, SITE_NAME, SUPPORT_EMAIL, whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: `Contact ${SITE_NAME} and answers to common questions about orders, delivery, returns and selling.`,
};

const faqs: { q: string; a: React.ReactNode }[] = [
  { q: "Do I need an account to order?", a: "No. Check out as a guest; you'll get an order reference to track your order." },
  { q: "How do I pay?", a: "By card or bank transfer in the secure Fairsure payment window. Your order is confirmed once the payment is verified." },
  { q: "Where is my order?", a: <>Use <Link href="/track-order" className="font-semibold underline">Track order</Link> with your order reference and the email or phone you used at checkout.</> },
  { q: "Can I return something?", a: <>Yes, unworn items with tags within {RETURN_WINDOW_DAYS} days of delivery. See <Link href="/delivery-returns" className="font-semibold underline">Delivery &amp; returns</Link>.</> },
  { q: "Who sells the products?", a: `${SITE_NAME} sells its own collection, and approved independent sellers sell theirs. Each product shows who sells it.` },
  { q: "How do I sell on Rebel Fashion?", a: <>Open a free store on the <Link href="/sell" className="font-semibold underline">Sell</Link> page. We keep {PLATFORM_COMMISSION_PERCENT}% of each sale and pay the rest to your bank account.</> },
  { q: "Something looks wrong with a listing", a: "Use \u201cReport this listing\u201d on the product page and our team will review it." },
];

export default function HelpPage() {
  const whatsapp = whatsappLink(`Hello ${SITE_NAME}, I need help with`);
  return (
    <InfoPage eyebrow="Help" title="Help & FAQ" intro="Quick answers below. Can't find yours? Get in touch.">
      <section aria-labelledby="contact">
        <h2 id="contact">Contact us</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f7a4d] px-6 text-xs font-bold uppercase tracking-wider text-white">
              Chat on WhatsApp
            </a>
          )}
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-6 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Email {SUPPORT_EMAIL}
            </a>
          )}
          {!whatsapp && !SUPPORT_EMAIL && <p>Our contact details will appear here shortly. Have your order reference ready.</p>}
        </div>
        <p className="mt-3 text-xs text-[color:var(--brand-charcoal)]/60">Please include your order reference so we can help faster.</p>
      </section>
      <section aria-labelledby="faq">
        <h2 id="faq">Frequently asked questions</h2>
        <div className="mt-3 divide-y divide-[color:var(--brand-border)] rounded-2xl border border-[color:var(--brand-border)] bg-white">
          {faqs.map((item) => (
            <details key={item.q} className="group px-4">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[color:var(--brand-deep)]">
                {item.q}
                <span aria-hidden="true" className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-[color:var(--brand-charcoal)]/80">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </InfoPage>
  );
}
