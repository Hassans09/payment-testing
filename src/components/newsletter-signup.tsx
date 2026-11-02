"use client";

import { FormEvent, useState } from "react";
import { Check } from "lucide-react";

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
    setMessage("Thanks for subscribing. You will receive updates on new arrivals and curated edits.");
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <div className="rounded-[22px] border border-[color:var(--brand-border)] bg-[linear-gradient(135deg,_rgba(253,249,244,1),_rgba(248,243,236,1))] p-6 sm:rounded-[28px] sm:p-10 lg:p-12">
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-3xl">
              New arrivals, in your inbox.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/70">
              Launches and restocks, now and then. Unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className="min-h-12 flex-1 rounded-full border border-[color:var(--brand-border)] bg-white px-5 text-base sm:text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)] shadow-2xs"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
              >
                Subscribe
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
          </form>
        </div>
      </div>
    </section>
  );
}
