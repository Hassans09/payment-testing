import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import AnimatedLogo from "@/components/animated-logo";
import { SITE_NAME } from "@/lib/config";

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
  { href: "/account", label: "Your orders" },
  { href: "/wishlist", label: "Wishlist" },
];

const footerSellLinks = [
  { href: "/sell", label: `Sell on ${SITE_NAME}` },
  { href: "/seller/login", label: "Seller login" },
];

const footerLegalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/delivery-returns", label: "Returns" },
  { href: "/help", label: "Contact" },
  { href: "/admin/login", label: "Admin" },
];

const linkClass = "inline-flex min-h-8 items-center transition hover:text-[color:var(--brand-primary)]";
const headingClass = "text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]";

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className={headingClass}>{title}</h3>
      <ul className="mt-3 space-y-1 text-[13px] text-[color:var(--brand-charcoal)]/70">
        {links.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[color:var(--brand-border)] bg-[color:var(--brand-white)] sm:mt-16">
      {/* Extra bottom padding on phones keeps the last line clear of the floating WhatsApp button. */}
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Store home">
              <AnimatedLogo className="min-w-[150px]" />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[color:var(--brand-charcoal)]/70">
              Clothing, shoes, bags and accessories from our own collection and approved sellers across Nigeria.
            </p>
          </div>

          <LinkColumn title="Shop" links={footerShopLinks} />
          <LinkColumn title="Help" links={footerHelpLinks} />
          <LinkColumn title="Sell" links={footerSellLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--brand-border)] pt-6 text-xs text-[color:var(--brand-charcoal)]/60 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--brand-primary)]" aria-hidden="true" />
            <span>Secure payments by Fairsure: card, transfer and USSD.</span>
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4">
            {footerLegalLinks.map((item) => (
              <Link key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <p>© 2026 {SITE_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
