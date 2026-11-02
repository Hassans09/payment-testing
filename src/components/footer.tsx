import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import AnimatedLogo from "@/components/animated-logo";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";
const footerShopLinks = [
  { href: "/shop", label: "All products" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/shop?gender=kids", label: "Kids" },
  { href: "/shop?sold=marketplace", label: "From our sellers" },
  { href: "/category/kaftans", label: `${SITE_NAME} kaftans` },
];

const footerHelpLinks = [
  { href: "/track-order", label: "Track your order" },
  { href: "/help", label: "Help & FAQ" },
  { href: "/delivery-returns", label: "Delivery & returns" },
];

const footerLegalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/delivery-returns", label: "Returns" },
  { href: "/help", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--brand-border)] bg-[color:var(--brand-white)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1fr_1fr]">
          {/* Brand Intro & Locations */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Store home">
              <AnimatedLogo className="min-w-[150px]" />
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-[color:var(--brand-charcoal)]/75">
              {SITE_NAME} is a fashion store for everyone: clothing and accessories from our own collection and from approved independent sellers across Nigeria.
            </p>
          </div>

          {/* Curated Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Shop
            </h3>
            <ul className="grid grid-cols-1 gap-2.5 text-xs text-[color:var(--brand-charcoal)]/75">
              {footerShopLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[color:var(--brand-primary)] transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Help &amp; Account
            </h3>
            <ul className="space-y-2.5 text-xs text-[color:var(--brand-charcoal)]/75">
              {footerHelpLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[color:var(--brand-primary)] transition">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="hover:text-[color:var(--brand-primary)] transition">
                  Your orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[color:var(--brand-primary)] transition">
                  My Wishlist Shortlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[color:var(--brand-primary)] transition">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-[color:var(--brand-primary)] transition">
                  Sell on {SITE_NAME} ({PLATFORM_COMMISSION_PERCENT}% commission)
                </Link>
              </li>
              <li>
                <Link href="/seller/login" className="hover:text-[color:var(--brand-primary)] transition">
                  Seller login
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[color:var(--brand-primary)] transition">
                  Admin
                </Link>
              </li>
            </ul>
          </div>


          {/* Verified Guarantee & Payment methods */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Secure Checkout
            </h3>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[color:var(--brand-deep)]">
                <ShieldCheck className="h-4 w-4 text-[color:var(--brand-primary)]" />
                <span>Secure Payment Gateway</span>
              </div>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Payments are processed securely by Fairsure. Sellers are paid out to their own bank accounts.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold text-[color:var(--brand-deep)]">
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Mastercard</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Visa</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Verve</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">USSD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[color:var(--brand-border)] pt-6 text-xs text-[color:var(--brand-charcoal)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE_NAME}. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
            {footerLegalLinks.map((item) => (
              <Link key={item.label} href={item.href} className="inline-flex min-h-8 items-center hover:text-[color:var(--brand-primary)] transition">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Encrypted ecommerce platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
