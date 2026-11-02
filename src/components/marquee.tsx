import { Sparkle } from "lucide-react";

/** Editorial scrolling band. Pure CSS, pauses on hover, static with reduced motion. */
export function Marquee({ items, tone = "dark" }: { items: string[]; tone?: "dark" | "light" }) {
  const row = [...items, ...items];
  const dark = tone === "dark";

  return (
    <div
      className={`rf-marquee overflow-hidden border-y ${
        dark
          ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-ink)] text-[color:var(--brand-soft)]"
          : "border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-[color:var(--brand-deep)]"
      }`}
      aria-label={items.join(", ")}
    >
      <div className="rf-marquee-track flex w-max items-center gap-10 py-3.5" aria-hidden="true">
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-lg italic tracking-wide sm:text-xl">{item}</span>
            <Sparkle className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
