import { readJSON, writeJSON } from "@/lib/client-storage";

/**
 * Order references placed in this browser, newest first, so guests see their orders on /account
 * without an account. With a real backend, signed-in shoppers would get GET /me/orders instead.
 */
// Bump the suffix to clear every browser's saved order list (done with the Nov 2026 data reset).
const KEY = "rf-my-orders-v2";

export type MyOrderRef = { reference: string; contact: string; createdAt: string };

export function readMyOrders(): MyOrderRef[] {
  return readJSON<MyOrderRef[]>(KEY, []);
}

export function rememberOrder(reference: string, contact: string) {
  const rest = readMyOrders().filter((item) => item.reference !== reference);
  writeJSON(KEY, [{ reference, contact, createdAt: new Date().toISOString() }, ...rest].slice(0, 30));
}
