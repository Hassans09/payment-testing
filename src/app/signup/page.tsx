"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      router.push("/account");
    }, 600);
  };

  const handleOAuthDemo = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/account");
    }, 500);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 sm:p-10 shadow-[0_20px_50px_rgba(91,64,50,0.06)] space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Join The Atelier
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
            Enjoy priority drop notifications, express checkout, and exclusive Nigerian member perks.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleOAuthDemo}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white py-2.5 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/40 transition shadow-2xs"
          >
            <span className="font-bold text-sm">G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleOAuthDemo}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white py-2.5 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/40 transition shadow-2xs"
          >
            <span className="font-bold text-sm"></span>
            <span>Apple</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[color:var(--brand-border)]" />
          <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/50">
            Or with details
          </span>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                First Name *
              </span>
              <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
                <User className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Maya"
                  className="w-full bg-transparent px-2.5 py-2.5 text-xs text-[color:var(--brand-charcoal)] outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                Last Name *
              </span>
              <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
                <User className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Adeleke"
                  className="w-full bg-transparent px-2.5 py-2.5 text-xs text-[color:var(--brand-charcoal)] outline-none"
                />
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
              Email Address *
            </span>
            <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
              <Mail className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="maya@example.ng"
                className="w-full bg-transparent px-2.5 py-2.5 text-xs text-[color:var(--brand-charcoal)] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
              Phone Number (+234)
            </span>
            <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
              <Phone className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 801 234 5678"
                className="w-full bg-transparent px-2.5 py-2.5 text-xs text-[color:var(--brand-charcoal)] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
              Password *
            </span>
            <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
              <Lock className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full bg-transparent px-2.5 py-2.5 text-xs text-[color:var(--brand-charcoal)] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[color:var(--brand-charcoal)]/60 hover:text-[color:var(--brand-deep)] transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-[color:var(--brand-primary)] py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        <div className="text-center text-xs text-[color:var(--brand-charcoal)]/70 pt-2 border-t border-[color:var(--brand-border)]/60">
          Already an Atelier member?{" "}
          <Link href="/signin" className="font-bold text-[color:var(--brand-deep)] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
