/**
 * Real backend implementation (used when NEXT_PUBLIC_API_MODE="http", or legacy NEXT_PUBLIC_USE_MOCK_API="false").
 *
 * Every call goes to `${NEXT_PUBLIC_API_BASE_URL}<path>`. The backend contract
 * (paths, JSON bodies, responses, auth) is documented in BACKEND.md.
 * Auth: the backend returns a token on login/signup; we keep it in
 * localStorage and send it as `Authorization: Bearer <token>`.
 */
import { API_BASE_URL } from "@/lib/config";
import { readString, removeKey, writeString } from "@/lib/client-storage";
import { compressImageToFile } from "@/lib/image-compress";
import type {
  ListingReport,
  PayoutSummary,
  PublicSellerProfile,
  ReviewSummary,
  TrackedOrder,
  AdminOverview,
  AdminSession,
  CategorySummary,
  CheckoutInit,
  Order,
  PaymentConfirmation,
  Product,
  ProductFilters,
  Seller,
  SellerOrderView,
  SellerSession,
} from "@/lib/types";
import { ApiError, type DataApi } from "./contract";

const SELLER_TOKEN_KEY = "rf-seller-token";
const ADMIN_TOKEN_KEY = "rf-admin-token";

type Auth = "none" | "seller" | "admin";

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: Auth; formData?: FormData } = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not set. Add it to your environment or switch back to the mock API.", 500);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const tokenKey = options.auth === "seller" ? SELLER_TOKEN_KEY : options.auth === "admin" ? ADMIN_TOKEN_KEY : null;
  if (tokenKey) {
    const token = readString(tokenKey);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

  if (!response.ok) {
    if (response.status === 401 && tokenKey) removeKey(tokenKey);
    throw new ApiError(data.error || data.message || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}

function toQuery(filters: ProductFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.gender && filters.gender !== "all") params.set("gender", filters.gender);
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.sellerId) params.set("seller", filters.sellerId);
  if (filters.ids?.length) params.set("ids", filters.ids.join(","));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const httpApi: DataApi = {
  // Catalogue
  getProducts: (filters) => request<Product[]>(`/products${toQuery(filters)}`),
  getCategories: () => request<CategorySummary[]>("/categories"),
  async getProduct(slugOrId) {
    try {
      return await request<Product>(`/products/${encodeURIComponent(slugOrId)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  async getSellerProfile(sellerId) {
    try {
      return await request<PublicSellerProfile>(`/sellers/${encodeURIComponent(sellerId)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  getReviews: (productId) => request<ReviewSummary>(`/products/${encodeURIComponent(productId)}/reviews`),
  addReview: (productId, input) =>
    request<ReviewSummary>(`/products/${encodeURIComponent(productId)}/reviews`, { method: "POST", body: input }),
  async reportListing(productId, input) {
    await request<unknown>(`/products/${encodeURIComponent(productId)}/reports`, { method: "POST", body: input });
  },
  async trackOrder(reference, emailOrPhone) {
    try {
      return await request<TrackedOrder>("/orders/track", { method: "POST", body: { reference, contact: emailOrPhone } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  // Sellers
  async createSeller(input) {
    const session = await request<SellerSession>("/sellers/signup", { method: "POST", body: input });
    writeString(SELLER_TOKEN_KEY, session.token);
    return session;
  },
  async loginSeller(email, password) {
    const session = await request<SellerSession>("/sellers/login", { method: "POST", body: { email, password } });
    writeString(SELLER_TOKEN_KEY, session.token);
    return session;
  },
  async logoutSeller() {
    try {
      await request("/sellers/logout", { method: "POST", auth: "seller" });
    } catch {
      // token may already be invalid
    }
    removeKey(SELLER_TOKEN_KEY);
  },
  async getCurrentSeller() {
    if (!readString(SELLER_TOKEN_KEY)) return null;
    try {
      return await request<Seller>("/sellers/me", { auth: "seller" });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  getSellerListings: () => request<Product[]>("/sellers/me/listings", { auth: "seller" }),
  createListing: (input) => request<Product>("/sellers/me/listings", { method: "POST", body: input, auth: "seller" }),
  async uploadListingImage(file) {
    // Phones upload a ~200 KB 1200px WebP/JPEG instead of the 5–15 MB original.
    const formData = new FormData();
    formData.append("file", await compressImageToFile(file));
    const result = await request<{ url: string }>("/uploads", { method: "POST", formData, auth: "seller" });
    return result.url;
  },
  getSellerOrders: () => request<SellerOrderView[]>("/sellers/me/orders", { auth: "seller" }),
  async deleteMyAccount(password) {
    await request<unknown>("/sellers/me", { method: "DELETE", body: { password }, auth: "seller" });
    removeKey(SELLER_TOKEN_KEY);
  },
  updateSellerProfile: (input) => request<Seller>("/sellers/me", { method: "PATCH", body: input, auth: "seller" }),
  updateListing: (id, input) =>
    request<Product>(`/sellers/me/listings/${encodeURIComponent(id)}`, { method: "PATCH", body: input, auth: "seller" }),
  setListingPaused: (id, paused) =>
    request<Product>(`/sellers/me/listings/${encodeURIComponent(id)}/${paused ? "pause" : "resume"}`, { method: "POST", auth: "seller" }),
  async deleteListing(id) {
    await request<unknown>(`/sellers/me/listings/${encodeURIComponent(id)}`, { method: "DELETE", auth: "seller" });
  },
  updateFulfilment: (orderId, status) =>
    request<SellerOrderView>(`/sellers/me/orders/${encodeURIComponent(orderId)}/fulfilment`, {
      method: "PATCH",
      body: { status },
      auth: "seller",
    }),

  // Admin
  async loginAdmin(email, password) {
    const session = await request<AdminSession>("/admin/login", { method: "POST", body: { email, password } });
    writeString(ADMIN_TOKEN_KEY, session.token);
    return session;
  },
  async logoutAdmin() {
    removeKey(ADMIN_TOKEN_KEY);
  },
  async getAdminSession() {
    if (!readString(ADMIN_TOKEN_KEY)) return null;
    try {
      return await request<AdminSession>("/admin/me", { auth: "admin" });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  getPendingListings: () => request<Product[]>("/admin/listings?status=pending", { auth: "admin" }),
  getAllProducts: () => request<Product[]>("/admin/products", { auth: "admin" }),
  approveListing: (id) => request<Product>(`/admin/listings/${encodeURIComponent(id)}/approve`, { method: "POST", auth: "admin" }),
  rejectListing: (id, reason) =>
    request<Product>(`/admin/listings/${encodeURIComponent(id)}/reject`, { method: "POST", body: { reason }, auth: "admin" }),
  getSellers: () => request<Seller[]>("/admin/sellers", { auth: "admin" }),
  setSellerStatus: (sellerId, status, reason) =>
    request<Seller>(`/admin/sellers/${encodeURIComponent(sellerId)}/status`, { method: "PATCH", body: { status, reason }, auth: "admin" }),
  async deleteSeller(sellerId) {
    await request<unknown>(`/admin/sellers/${encodeURIComponent(sellerId)}`, { method: "DELETE", auth: "admin" });
  },
  getReports: () => request<ListingReport[]>("/admin/reports", { auth: "admin" }),
  resolveReport: (id) => request<ListingReport>(`/admin/reports/${encodeURIComponent(id)}/resolve`, { method: "POST", auth: "admin" }),
  getPayouts: () => request<PayoutSummary[]>("/admin/payouts", { auth: "admin" }),
  getOrders: () => request<Order[]>("/admin/orders", { auth: "admin" }),
  updateOrderStatus: (id, status) =>
    request<Order>(`/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: { status }, auth: "admin" }),
  getAdminOverview: () => request<AdminOverview>("/admin/overview", { auth: "admin" }),

  // Orders
  createOrder: (input) => request<CheckoutInit>("/orders", { method: "POST", body: input }),
  confirmPayment: (ref, transactionRef) =>
    request<PaymentConfirmation>(`/orders/${encodeURIComponent(ref)}/confirm`, {
      method: "POST",
      body: transactionRef ? { transactionRef } : {},
    }),
  async getOrderByReference(reference) {
    try {
      return await request<Order>(`/orders/${encodeURIComponent(reference)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
