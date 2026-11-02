/**
 * Global platform settings.
 *
 * Rename the brand, change the commission or tweak shipping prices here and
 * the whole frontend follows. Nothing in this file is secret: it ships to the
 * browser. Never put API keys or payment PRIVATE keys in this file.
 */

/** Brand name shown in the header, splash screen, footer and page titles. */
export const SITE_NAME = "Rebel Fashion";

/** Short line used under the brand name (splash screen, meta description). */
export const SITE_TAGLINE = "Fashion for everyone";

/**
 * Percentage the platform keeps from every marketplace sale.
 * Sellers receive (100 - PLATFORM_COMMISSION_PERCENT)% of each line.
 * The backend must use the same value when it records each order's seller share and
 * commission, and when it pays sellers out (see "Payments with Fairsure" in BACKEND.md).
 */
export const PLATFORM_COMMISSION_PERCENT = 10;

/**
 * The fixed list of shop categories. Every product has exactly one (`Product.category` holds the slug).
 * The navigation and the shop chips only show categories that have at least one approved product,
 * so a new category appears automatically once a seller's listing in it is approved.
 * The backend must accept exactly these slugs (see BACKEND.md, "Categories").
 */
export const CATEGORIES = [
  { slug: "kaftans", name: "Kaftans" },
  { slug: "hoodies", name: "Hoodies" },
  { slug: "jeans", name: "Jeans" },
  { slug: "t-shirts-shirts", name: "T-shirts & Shirts" },
  { slug: "dresses", name: "Dresses" },
  { slug: "shoes", name: "Shoes" },
  { slug: "bags", name: "Bags" },
  { slug: "accessories", name: "Accessories" },
  { slug: "other", name: "Other" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function isCategorySlug(value: unknown): value is CategorySlug {
  return typeof value === "string" && CATEGORIES.some((category) => category.slug === value);
}

export function categoryName(slug: string | null | undefined): string {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? "Other";
}

/** Seller id used for the platform's own (first-party) products, shown as "Sold by Rebel Fashion". */
export const PLATFORM_SELLER_ID = "platform";

/** Shipping prices in Naira, used by checkout and the mock payment route. */
export const SHIPPING_RATES = {
  standard: 3500,
  priority: 6500,
} as const;

/** Currency used across the store. */
export const CURRENCY = "NGN";

/**
 * Data source switch: which implementation of src/lib/api/contract.ts runs.
 * - "mock"     -> demo store in the browser (localStorage). Default.
 * - "http"     -> the backend's REST API at NEXT_PUBLIC_API_BASE_URL (src/lib/api/http.ts).
 *                 Primary production path: Next.js API routes in this app (e.g. "/api/v1"), any database.
 * - "supabase" -> optional, reserved for src/lib/api/supabase.ts (see the appendix in BACKEND.md)
 *
 * Set NEXT_PUBLIC_API_MODE. For backward compatibility, NEXT_PUBLIC_USE_MOCK_API="false"
 * (with no NEXT_PUBLIC_API_MODE) still means "http".
 */
export type ApiMode = "mock" | "http" | "supabase";

function resolveApiMode(): ApiMode {
  const mode = (process.env.NEXT_PUBLIC_API_MODE ?? "").trim().toLowerCase();
  if (mode === "mock" || mode === "http" || mode === "supabase") return mode;
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === "false") return "http";
  return "mock";
}

export const API_MODE: ApiMode = resolveApiMode();

/** True when the browser-only demo store is active. */
export const USE_MOCK_API = API_MODE === "mock";

/** Base URL of the real backend, e.g. "/api/v1" (Next.js API routes in this app) or https://api.example.com/api/v1 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Admin login used by the mock API only. Never shown anywhere in the UI.
 * Once a real backend is connected these values are ignored: the backend
 * checks admin credentials itself (Supabase: a profile with role "admin").
 */
export const ADMIN_DEMO_CREDENTIALS = {
  email: "admin@rebelfashion.demo",
  password: "RebelAdmin2026",
  name: "Platform Admin",
} as const;

/** Small artificial delay (ms) the mock API adds so loading states are visible. */
export const MOCK_API_DELAY_MS = 250;

/* ───────────── Payments (Fairsure) ─────────────
 * Only PUBLIC values live here. The Fairsure PRIVATE key (FAIRSURE_PRIVATE_KEY) is server-only
 * and must never be referenced from frontend code or a NEXT_PUBLIC_* variable.
 */

/** "sandbox" (default) or "live": picks the Fairsure inline script and checkout host. */
export const FAIRSURE_ENV: "sandbox" | "live" =
  (process.env.NEXT_PUBLIC_FAIRSURE_ENV ?? "").trim().toLowerCase() === "live" ? "live" : "sandbox";

/** Public key (TEST_… / LIVE_…). Optional: the checkout-init response may also return it. */
export const FAIRSURE_PUBLIC_KEY = (process.env.NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY ?? "").trim();
