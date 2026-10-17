"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
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

  const fillDemoCredentials = () => {
    setEmail("maya@rebelfashion.ng");
    setPassword("rebelAtelier2026");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-8 sm:p-10 shadow-[0_20px_50px_rgba(91,64,50,0.06)] space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Member Access
          </span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Sign In
          </h1>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
            Access your orders, tracked deliveries, and saved boutique wishlist.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid gap-2.5">
          <button
            type="button"
            onClick={handleOAuthDemo}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white py-2.5 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/40 transition shadow-2xs"
          >
            <span className="font-bold text-sm">G</span>
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            onClick={handleOAuthDemo}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-white py-2.5 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/40 transition shadow-2xs"
          >
            <span className="font-bold text-sm"></span>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[color:var(--brand-border)]" />
          <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/50">
            Or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
              Email Address
            </span>
            <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
              <Mail className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya@example.ng"
                className="w-full bg-transparent px-2.5 py-3 text-xs text-[color:var(--brand-charcoal)] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                Password
              </span>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-[color:var(--brand-primary)] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
              <Lock className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-2.5 py-3 text-xs text-[color:var(--brand-charcoal)] outline-none"
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
            {loading ? "Signing In..." : "Sign In to Account"}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 p-3 text-center">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-[11px] font-semibold text-[color:var(--brand-deep)] hover:underline"
          >
            ⚡ Click to Auto-Fill VIP Demo Credentials (Maya Adeleke)
          </button>
        </div>

        <div className="text-center text-xs text-[color:var(--brand-charcoal)]/70 pt-2 border-t border-[color:var(--brand-border)]/60">
          New to Rebel Fashion?{" "}
          <Link href="/signup" className="font-bold text-[color:var(--brand-deep)] hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
