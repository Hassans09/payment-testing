"use client";

import { FormEvent, useState } from "react";
import { Check, Sparkles } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    if (!isValid) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("success");
    setMessage("Welcome to Rebel Atelier! Use promo code REBEL10 at checkout for 10% off your first order.");
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[linear-gradient(135deg,_rgba(253,249,244,1),_rgba(248,243,236,1))] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(91,64,50,0.05)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Atelier Insiders Club</span>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
              Unlock 10% off your first drop.
            </h2>
            <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/75 max-w-lg leading-relaxed">
              Subscribe for VIP priority notifications on limited-run heavyweight tees, pop-up events in Lagos & Abuja, and private seasonal sales.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 rounded-full border border-[color:var(--brand-border)] bg-white px-5 py-3.5 text-xs text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)] shadow-2xs"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
              >
                Join Atelier
              </button>
            </div>

            {status === "success" && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900 flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <p className="text-xs font-semibold text-red-600">{message}</p>
            )}

            <p className="text-[11px] text-[color:var(--brand-charcoal)]/55">
              By joining, you agree to receive editorial releases. Unsubscribe anytime in one click.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
