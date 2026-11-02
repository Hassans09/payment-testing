"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { loginSeller } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";

export default function SellerLoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      eyebrow="Seller centre"
      title="Welcome back"
      subtitle={`Log in to manage your ${SITE_NAME} store.`}
      onLogin={async (email, password) => {
        await loginSeller(email, password);
        router.push("/seller/dashboard");
      }}
      footer={
        <p>
          New here? <Link href="/seller/signup" className="font-semibold text-[color:var(--brand-deep)] underline">Create a seller account</Link>
        </p>
      }
    />
  );
}
