/**
 * Browser helper for the Fairsure inline checkout (https://docs.fairsurepay.com/).
 *
 * Only the PUBLIC key (TEST_… / LIVE_…) is ever used here. Payment success reported by the
 * modal is a UX hint only: the success page asks the backend to verify the payment with the
 * Fairsure PRIVATE key (api.confirmPayment) before the order counts as paid.
 */
import { FAIRSURE_ENV, FAIRSURE_PUBLIC_KEY } from "@/lib/config";

export const FAIRSURE_SCRIPT_URLS = {
  sandbox: "https://checkout-sandbox.fairsurepay.com/js/host/fairsure-checkout-inline.js",
  live: "https://checkout.fairsurepay.com/js/host/fairsure-checkout-inline.js",
} as const;

/** Hosted checkout iframe hosts (set as window.FAIRSURE_CHECKOUT_CONFIG before the script loads). */
export const FAIRSURE_CHECKOUT_HOSTS = {
  sandbox: "https://checkout-sandbox.fairsurepay.com/",
  live: "https://checkout.fairsurepay.com/",
} as const;

export type FairsureSuccess = {
  transactionRef?: string;
  amount?: number | string;
  paymentReference?: string;
  [key: string]: unknown;
};

/**
 * Payment channel the Fairsure modal opens on. Not in the public docs, but supported by the
 * inline script (`paymentMethod` / `payment_method` option, forwarded to the hosted checkout as
 * `?paymentMethod=` and in the postMessage payload) and by Fairsure's WordPress plugin
 * (`payment_method="bankCard"`). Any other value is ignored and the buyer sees the method picker.
 */
export type FairsurePaymentMethod = "bankCard" | "bankTransfer" | "ussd";

/** Maps the store's checkout choice to the Fairsure channel. */
export const FAIRSURE_METHOD_FOR = {
  card: "bankCard",
  transfer: "bankTransfer",
  ussd: "ussd",
} as const satisfies Record<string, FairsurePaymentMethod>;

export type FairsureError = { message?: string; [key: string]: unknown };

export type FairsureSetupOptions = {
  key: string;
  email: string;
  /** Naira, not kobo. */
  amount: number;
  currency: "NGN";
  first_name: string;
  last_name: string;
  phone_number?: string;
  customerId?: string;
  ref: string;
  narration?: string;
  callback_url?: string;
  /** Opens the modal straight on this channel (the buyer can still switch inside the modal). */
  paymentMethod?: FairsurePaymentMethod;
  onSuccess?: (response: FairsureSuccess) => void;
  onError?: (response: FairsureError) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    FairsureCheckout?: { setup: (options: FairsureSetupOptions) => void };
    FAIRSURE_CHECKOUT_CONFIG?: { checkoutUrl: string };
  }
}

/** Public key to use: the one returned by checkout-init wins, then NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY. */
export function resolvePublicKey(fromServer?: string | null): string {
  const key = (fromServer ?? "").trim() || FAIRSURE_PUBLIC_KEY;
  // Defence in depth: never send anything that looks like a private key to the browser SDK.
  if (/^(test|live)_/.test(key) && !/^(TEST|LIVE)_/.test(key)) return "";
  return key;
}

let scriptPromise: Promise<void> | null = null;

/** Loads the Fairsure inline script once (sandbox or live, from NEXT_PUBLIC_FAIRSURE_ENV). */
export function loadFairsureScript(env: "sandbox" | "live" = FAIRSURE_ENV): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Fairsure checkout only runs in the browser."));
  if (window.FairsureCheckout) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  // The inline script decides its iframe host ONCE, when it loads: on localhost, LAN IPs or plain
  // http it falls back to http://localhost:3000/ (Fairsure's own dev server). Setting the config
  // before loading always points it at the hosted checkout for the chosen environment, so testing
  // from localhost or a phone on the LAN works too.
  if (!window.FAIRSURE_CHECKOUT_CONFIG) {
    window.FAIRSURE_CHECKOUT_CONFIG = { checkoutUrl: FAIRSURE_CHECKOUT_HOSTS[env] };
  }

  const src = FAIRSURE_SCRIPT_URLS[env];
  scriptPromise = new Promise<void>((resolve, reject) => {
    const fail = () => {
      scriptPromise = null;
      reject(new Error("We couldn't load the secure payment window. Check your connection and try again."));
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existing ?? document.createElement("script");
    const timer = window.setTimeout(fail, 20000);
    script.addEventListener("load", () => {
      window.clearTimeout(timer);
      if (window.FairsureCheckout) resolve();
      else fail();
    });
    script.addEventListener("error", () => {
      window.clearTimeout(timer);
      fail();
    });
    if (!existing) {
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  });
  return scriptPromise;
}

/** Splits "Aisha Bello Yusuf" into first "Aisha" and last "Bello Yusuf" (Fairsure needs both). */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "Customer";
  const last = parts.slice(1).join(" ") || first;
  return { first, last };
}

/** Nigerian phone to E.164 (+234…), as Fairsure recommends. Leaves other formats alone. */
export function toE164Nigeria(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return phone.trim();
}

/** Opens the modal. Resolves when setup() was called; outcomes arrive through the callbacks. */
export async function openFairsureCheckout(options: FairsureSetupOptions): Promise<void> {
  await loadFairsureScript();
  if (!window.FairsureCheckout) throw new Error("The secure payment window is not available right now.");
  window.FairsureCheckout.setup(options);
}
