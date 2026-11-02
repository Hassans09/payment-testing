"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAsync } from "@/hooks/use-async";
import { getAdminSession, getCurrentSeller } from "@/lib/api";

/** Loads the signed-in seller; sends visitors without a session to /seller/login. */
export function useSellerSession() {
  const router = useRouter();
  const { data: seller, loading, reload } = useAsync(() => getCurrentSeller(), []);

  useEffect(() => {
    if (!loading && !seller) router.replace("/seller/login");
  }, [loading, seller, router]);

  return { seller: seller ?? null, loading, reload };
}

/** Loads the admin session; sends visitors without one to /admin/login. */
export function useAdminSession() {
  const router = useRouter();
  const { data: admin, loading } = useAsync(() => getAdminSession(), []);

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin/login");
  }, [loading, admin, router]);

  return { admin: admin ?? null, loading };
}
