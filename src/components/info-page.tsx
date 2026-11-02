import Link from "next/link";
import type { ReactNode } from "react";

/** Shared shell for the help / policy pages: short header, readable column, related links. */
export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="font-display mt-2 text-3xl text-[color:var(--brand-deep)] sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75 sm:text-base">{intro}</p>}
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/85 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[color:var(--brand-deep)] [&_li]:ml-5 [&_li]:list-disc [&_li]:mt-1">
        {children}
      </div>
      <nav aria-label="Help pages" className="mt-12 flex flex-wrap gap-x-5 gap-y-1 border-t border-[color:var(--brand-border)] pt-5 text-xs font-semibold uppercase tracking-wider">
        {[
          ["/help", "Help & FAQ"],
          ["/track-order", "Track order"],
          ["/delivery-returns", "Delivery & returns"],
          ["/terms", "Terms"],
          ["/privacy", "Privacy"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="inline-flex min-h-11 items-center text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)]">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
