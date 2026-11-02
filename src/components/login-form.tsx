"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Card, ErrorNote, Field, inputClass, primaryButtonClass } from "@/components/ui/form";

/** Shared email + password form used by the seller and admin login pages. */
export function LoginForm({
  eyebrow,
  title,
  subtitle,
  onLogin,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onLogin: (email: string, password: string) => Promise<void>;
  footer?: ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)]">{title}</h1>
        <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">{subtitle}</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <ErrorNote message={error} />
          <Field label="Email" htmlFor="login-email">
            <input id="login-email" type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <input id="login-password" type="password" autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>
      </Card>
      {footer && <div className="mt-6 text-center text-sm text-[color:var(--brand-charcoal)]/70">{footer}</div>}
    </div>
  );
}
