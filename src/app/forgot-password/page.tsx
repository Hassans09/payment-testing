"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 sm:p-10 shadow-[0_20px_50px_rgba(91,64,50,0.06)] space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Account Security
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
            Enter the email address registered with your Rebel Fashion account.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm text-emerald-900">Check Your Inbox</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We&apos;ve dispatched a secure password reset link to <strong>{email}</strong>. Please check your email or spam folder.
            </p>
            <Link
              href="/signin"
              className="inline-block pt-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                Email Address
              </span>
              <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
                <Mail className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.ng"
                  className="w-full bg-transparent px-2.5 py-3 text-xs text-[color:var(--brand-charcoal)] outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-[color:var(--brand-primary)] py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
            >
              Send Password Reset Link
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-[color:var(--brand-border)]/60 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
