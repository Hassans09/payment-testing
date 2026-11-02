/**
 * THE single entry point for data in the frontend.
 *
 * Components import from "@/lib/api" and never talk to localStorage, fetch() or
 * a database client for domain data directly. Which implementation runs is
 * decided by NEXT_PUBLIC_API_MODE (see src/lib/config.ts and BACKEND.md):
 *   - mock.ts      -> demo store in the browser (default)
 *   - http.ts      -> the backend's REST API at NEXT_PUBLIC_API_BASE_URL (primary: Next.js
 *                     API routes in this app under /api/v1, with any database)
 *   - supabase.ts  -> optional, not written. To add it: create src/lib/api/supabase.ts
 *                     exporting `supabaseApi: DataApi`, import it below and add
 *                     it to `implementations`. Nothing else changes.
 */
import { API_MODE, type ApiMode } from "@/lib/config";
import type { DataApi } from "./contract";
import { httpApi } from "./http";
import { mockApi } from "./mock";
// import { supabaseApi } from "./supabase";

const implementations: Partial<Record<ApiMode, DataApi>> = {
  mock: mockApi,
  http: httpApi,
  // supabase: supabaseApi,
};

function pickImplementation(): DataApi {
  const chosen = implementations[API_MODE];
  if (chosen) return chosen;
  if (typeof console !== "undefined") {
    console.warn(`[api] NEXT_PUBLIC_API_MODE="${API_MODE}" has no implementation yet; falling back to the mock API.`);
  }
  return mockApi;
}

export const api: DataApi = pickImplementation();

export { ApiError } from "./contract";
export type { DataApi } from "./contract";

export const getProducts: DataApi["getProducts"] = (...args) => api.getProducts(...args);
export const getCategories: DataApi["getCategories"] = (...args) => api.getCategories(...args);
export const getProduct: DataApi["getProduct"] = (...args) => api.getProduct(...args);

export const createSeller: DataApi["createSeller"] = (...args) => api.createSeller(...args);
export const loginSeller: DataApi["loginSeller"] = (...args) => api.loginSeller(...args);
export const logoutSeller: DataApi["logoutSeller"] = (...args) => api.logoutSeller(...args);
export const getCurrentSeller: DataApi["getCurrentSeller"] = (...args) => api.getCurrentSeller(...args);
export const getSellerListings: DataApi["getSellerListings"] = (...args) => api.getSellerListings(...args);
export const createListing: DataApi["createListing"] = (...args) => api.createListing(...args);
export const uploadListingImage: DataApi["uploadListingImage"] = (...args) => api.uploadListingImage(...args);
export const getSellerOrders: DataApi["getSellerOrders"] = (...args) => api.getSellerOrders(...args);

export const loginAdmin: DataApi["loginAdmin"] = (...args) => api.loginAdmin(...args);
export const logoutAdmin: DataApi["logoutAdmin"] = (...args) => api.logoutAdmin(...args);
export const getAdminSession: DataApi["getAdminSession"] = (...args) => api.getAdminSession(...args);
export const getPendingListings: DataApi["getPendingListings"] = (...args) => api.getPendingListings(...args);
export const getAllProducts: DataApi["getAllProducts"] = (...args) => api.getAllProducts(...args);
export const approveListing: DataApi["approveListing"] = (...args) => api.approveListing(...args);
export const rejectListing: DataApi["rejectListing"] = (...args) => api.rejectListing(...args);
export const getSellers: DataApi["getSellers"] = (...args) => api.getSellers(...args);
export const getOrders: DataApi["getOrders"] = (...args) => api.getOrders(...args);
export const updateOrderStatus: DataApi["updateOrderStatus"] = (...args) => api.updateOrderStatus(...args);
export const getAdminOverview: DataApi["getAdminOverview"] = (...args) => api.getAdminOverview(...args);

export const createOrder: DataApi["createOrder"] = (...args) => api.createOrder(...args);
/** Alias with the name used in BACKEND.md: starts checkout and returns the Fairsure init values. */
export const initCheckout: DataApi["createOrder"] = (...args) => api.createOrder(...args);
export const confirmPayment: DataApi["confirmPayment"] = (...args) => api.confirmPayment(...args);
export const getOrderByReference: DataApi["getOrderByReference"] = (...args) => api.getOrderByReference(...args);

export const getSellerProfile: DataApi["getSellerProfile"] = (...args) => api.getSellerProfile(...args);
export const getReviews: DataApi["getReviews"] = (...args) => api.getReviews(...args);
export const addReview: DataApi["addReview"] = (...args) => api.addReview(...args);
export const reportListing: DataApi["reportListing"] = (...args) => api.reportListing(...args);
export const trackOrder: DataApi["trackOrder"] = (...args) => api.trackOrder(...args);
export const updateSellerProfile: DataApi["updateSellerProfile"] = (...args) => api.updateSellerProfile(...args);
export const updateListing: DataApi["updateListing"] = (...args) => api.updateListing(...args);
export const setListingPaused: DataApi["setListingPaused"] = (...args) => api.setListingPaused(...args);
export const deleteListing: DataApi["deleteListing"] = (...args) => api.deleteListing(...args);
export const updateFulfilment: DataApi["updateFulfilment"] = (...args) => api.updateFulfilment(...args);
export const setSellerStatus: DataApi["setSellerStatus"] = (...args) => api.setSellerStatus(...args);
export const getReports: DataApi["getReports"] = (...args) => api.getReports(...args);
export const resolveReport: DataApi["resolveReport"] = (...args) => api.resolveReport(...args);
export const getPayouts: DataApi["getPayouts"] = (...args) => api.getPayouts(...args);
