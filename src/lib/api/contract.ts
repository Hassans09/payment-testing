import type {
  FulfilmentStatus,
  ListingReport,
  ListingUpdateInput,
  PayoutSummary,
  PublicSellerProfile,
  ReportInput,
  ReviewInput,
  ReviewSummary,
  SellerProfileInput,
  SellerStatus,
  TrackedOrder,
  AdminOverview,
  AdminSession,
  CategorySummary,
  CheckoutInit,
  CreateOrderInput,
  NewListingInput,
  Order,
  OrderStatus,
  PaymentConfirmation,
  Product,
  ProductFilters,
  Seller,
  SellerOrderView,
  SellerSession,
  SellerSignupInput,
} from "@/lib/types";

/**
 * Every data operation the frontend needs. Every implementation (mock.ts,
 * http.ts, and later e.g. supabase.ts) must provide exactly these functions,
 * so swapping the data source never touches a component.
 * Each function maps to one REST endpoint documented in BACKEND.md.
 */
export interface DataApi {
  // ── Catalogue (public) ──
  /** Approved products only. */
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  /** Every category in CATEGORIES with its number of approved products (also the empty ones). */
  getCategories(): Promise<CategorySummary[]>;
  /** Approved product by slug or id, or null. */
  getProduct(slugOrId: string): Promise<Product | null>;
  /** Public storefront profile of an active seller (or the platform itself), or null. */
  getSellerProfile(sellerId: string): Promise<PublicSellerProfile | null>;
  getReviews(productId: string): Promise<ReviewSummary>;
  addReview(productId: string, input: ReviewInput): Promise<ReviewSummary>;
  reportListing(productId: string, input: ReportInput): Promise<void>;
  /** Order lookup for guests: reference + the email or phone used at checkout. */
  trackOrder(reference: string, emailOrPhone: string): Promise<TrackedOrder | null>;

  // ── Sellers ──
  createSeller(input: SellerSignupInput): Promise<SellerSession>;
  loginSeller(email: string, password: string): Promise<SellerSession>;
  logoutSeller(): Promise<void>;
  /** Seller for the stored session token, or null when signed out. */
  getCurrentSeller(): Promise<Seller | null>;
  /** All of the signed-in seller's listings, any status. */
  getSellerListings(): Promise<Product[]>;
  /** Submits a listing; it starts as "pending". */
  createListing(input: NewListingInput): Promise<Product>;
  /** Uploads one listing photo and returns its URL (data URL in mock mode). */
  uploadListingImage(file: File): Promise<string>;
  /** Orders that contain the signed-in seller's products (their lines only). */
  getSellerOrders(): Promise<SellerOrderView[]>;
  updateSellerProfile(input: SellerProfileInput): Promise<Seller>;
  /** Permanently deletes the signed-in seller's account and listings. Needs their password. */
  deleteMyAccount(password: string): Promise<void>;
  updateListing(productId: string, input: ListingUpdateInput): Promise<Product>;
  /** Paused listings are hidden from the shop until resumed. Only approved/paused listings. */
  setListingPaused(productId: string, paused: boolean): Promise<Product>;
  deleteListing(productId: string): Promise<void>;
  /** The seller's fulfilment of their lines in one order. */
  updateFulfilment(orderId: string, status: FulfilmentStatus): Promise<SellerOrderView>;

  // ── Admin ──
  loginAdmin(email: string, password: string): Promise<AdminSession>;
  logoutAdmin(): Promise<void>;
  getAdminSession(): Promise<AdminSession | null>;
  getPendingListings(): Promise<Product[]>;
  /** Every product, any status. */
  getAllProducts(): Promise<Product[]>;
  approveListing(productId: string): Promise<Product>;
  rejectListing(productId: string, reason: string): Promise<Product>;
  getSellers(): Promise<Seller[]>;
  /** Approve (active), reject or suspend a seller; a reason is required for reject/suspend. */
  setSellerStatus(sellerId: string, status: SellerStatus, reason?: string): Promise<Seller>;
  /** Permanently deletes a seller account and its listings. Past orders are kept for records. */
  deleteSeller(sellerId: string): Promise<void>;
  getReports(): Promise<ListingReport[]>;
  resolveReport(reportId: string): Promise<ListingReport>;
  getPayouts(): Promise<PayoutSummary[]>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  getAdminOverview(): Promise<AdminOverview>;

  // ── Orders / checkout (Fairsure) ──
  /**
   * Creates the order (status "pending") from server-side prices and returns what the browser
   * needs to open the Fairsure inline checkout: { orderId, ref, amount, publicKey }.
   */
  createOrder(input: CreateOrderInput): Promise<CheckoutInit>;
  /**
   * Asks the backend to verify the payment for `ref` with Fairsure (private key, server-side)
   * and returns the order's payment state. Called by /checkout/success.
   */
  confirmPayment(ref: string, transactionRef?: string): Promise<PaymentConfirmation>;
  getOrderByReference(reference: string): Promise<Order | null>;
}

/** Error with an HTTP-like status, thrown by both implementations. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
