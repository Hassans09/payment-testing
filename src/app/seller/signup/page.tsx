"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Landmark, LoaderCircle, LockKeyhole, Store } from "lucide-react";

import { Card, ErrorNote, Field, inputClass, primaryButtonClass } from "@/components/ui/form";
import { createSeller } from "@/lib/api";
import { NIGERIAN_BANKS } from "@/lib/banks";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";

const emptyForm = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  agree: false,
};

type FormState = typeof emptyForm;

export default function SellerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim()) next.businessName = "Enter your business or brand name.";
    if (!form.ownerName.trim()) next.ownerName = "Enter the owner's full name.";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) next.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match.";
    if (!form.bankName) next.bankName = "Choose your bank.";
    if (!/^\d{10}$/.test(form.accountNumber)) next.accountNumber = "Account number must be 10 digits.";
    if (!form.accountName.trim()) next.accountName = "Enter the account name exactly as on your bank account.";
    if (!form.agree) next.agree = "Please accept the seller terms.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createSeller({
        businessName: form.businessName,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        bank: { bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName },
        acceptTerms: form.agree,
      });
      router.push("/seller/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="eyebrow">Sell on {SITE_NAME}</span>
        <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">Open your store</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[color:var(--brand-charcoal)]/70">
          Sell any clothing, shoes, bags or accessories. Free to join: we keep {PLATFORM_COMMISSION_PERCENT}% of each sale and pay your share to the bank account below.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <ErrorNote message={submitError} />

        <Card>
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <Store className="h-4 w-4 text-[color:var(--brand-primary)]" /> Business details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" htmlFor="businessName" error={errors.businessName} className="sm:col-span-2">
              <input id="businessName" className={inputClass} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Arewa Threads" />
            </Field>
            <Field label="Owner's full name" htmlFor="ownerName" error={errors.ownerName}>
              <input id="ownerName" className={inputClass} value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <input id="phone" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="080..." />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <LockKeyhole className="h-4 w-4 text-[color:var(--brand-primary)]" /> Login details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" error={errors.email} className="sm:col-span-2">
              <input id="email" type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
              <input id="password" type="password" className={inputClass} value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
              <input id="confirmPassword" type="password" className={inputClass} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
            <Landmark className="h-4 w-4 text-[color:var(--brand-primary)]" /> Payout bank account
          </h2>
          <p className="mb-5 text-xs text-[color:var(--brand-charcoal)]/65">
            Where we pay your share ({100 - PLATFORM_COMMISSION_PERCENT}% of each sale). We verify the account before your first payout.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank" htmlFor="bankName" error={errors.bankName}>
              <select id="bankName" className={inputClass} value={form.bankName} onChange={(e) => update("bankName", e.target.value)}>
                <option value="">Select bank</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </Field>
            <Field label="Account number" htmlFor="accountNumber" error={errors.accountNumber} hint="10-digit NUBAN">
              <input id="accountNumber" className={inputClass} value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" />
            </Field>
            <Field label="Account name" htmlFor="accountName" error={errors.accountName} className="sm:col-span-2">
              <input id="accountName" className={inputClass} value={form.accountName} onChange={(e) => update("accountName", e.target.value)} />
            </Field>
          </div>
        </Card>

        <label className="flex items-start gap-3 text-sm text-[color:var(--brand-charcoal)]/80">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[color:var(--brand-deep)]" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} />
          <span>
            I agree to the <Link href="/terms#sellers" target="_blank" className="font-semibold underline">seller terms</Link>, including the {PLATFORM_COMMISSION_PERCENT}% commission on each sale and that listings are reviewed before going live.
            {errors.agree && <span className="mt-1 block text-xs font-semibold text-red-600">{errors.agree}</span>}
          </span>
        </label>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-[color:var(--brand-charcoal)]/70">
            Already selling? <Link href="/seller/login" className="font-semibold text-[color:var(--brand-deep)] underline">Log in</Link>
          </p>
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full sm:w-auto`}>
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Create seller account
          </button>
        </div>
      </form>
    </div>
  );
}
