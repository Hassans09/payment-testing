import type { ReactNode } from "react";

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/20";

export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[color:var(--brand-charcoal)]/55">{hint}</p>}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[color:var(--brand-border)] bg-white p-5 shadow-[0_12px_35px_rgba(91,64,50,0.05)] sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-charcoal)]/55">{label}</p>
      <p className="font-display mt-2 break-words text-xl text-[color:var(--brand-deep)] min-[380px]:text-2xl sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-[color:var(--brand-charcoal)]/55">{hint}</p>}
    </div>
  );
}
