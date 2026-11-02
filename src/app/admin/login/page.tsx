"use client";

import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { loginAdmin } from "@/lib/api";
import { SITE_NAME } from "@/lib/config";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      eyebrow={`${SITE_NAME} admin`}
      title="Admin login"
      subtitle="Review listings, manage sellers and orders."
      onLogin={async (email, password) => {
        await loginAdmin(email, password);
        router.push("/admin");
      }}
    />
  );
}
