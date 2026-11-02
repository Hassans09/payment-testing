/**
 * Domain types shared by the UI, the mock API and the real HTTP API.
 * The backend should return JSON that matches these shapes (see BACKEND.md).
 * All money values are whole Naira (NGN), not kobo.
 */

import type { CategorySlug } from "@/lib/config";

export type { CategorySlug };

export type Gender = "men" | "women" | "kids" | "unisex";

/**
 * Listing status. Only "approved" products are visible in the shop.
 * "paused" = approved before, temporarily hidden by its seller (resuming makes it live again).
 */
export type ListingStatus = "pending" | "approved" | "rejected" | "paused";

/**
 * The "Type" choice a shopper makes before adding to the bag, e.g.
 * { label: "Length", values: ["Short", "Long"] } or { label: "For", values: ["Men", "Women"] }.
 * Optional: products without it only ask for colour and size.
 */
export type ProductTypeOption = {
  /** Heading shown above the choices, e.g. "Length", "Fit", "For", "Set". */
  label: string;
  /** The choices, e.g. ["Short", "Long"]. */
  values: string[];
};

/** One colour option of a product. `image`/`images` are optional colour-specific photos. */
export type ColorVariant = {
  name: string;
  /** CSS colour used for the swatch, e.g. "#7B1E2B". */
  hex: string;
  /** Main photo for this colour. Falls back to the product's first image. */
  image?: string;
  /** Extra photos for this colour (gallery). */
  images?: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** One of the fixed categories in CATEGORIES (src/lib/config.ts), stored as its slug, e.g. "kaftans". */
  category: CategorySlug;
  /** Optional free-text detail entered by the seller, e.g. "Linen kaftan", "Oversized shirt". "" when not given. Display only. */
  productType: string;
  /** "unisex" also means "not specified". */
  gender: Gender;
  /** Optional Type choice (e.g. Short/Long). Shoppers must pick one when present. */
  typeOption?: ProductTypeOption | null;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  featured?: boolean;
  /** General product photos (URLs). Colour photos live on each ColorVariant. */
  images: string[];
  colors: ColorVariant[];
  sizes: string[];
  stock: number;
  material: string;
  fit: string;
  care: string;
  sellerId: string;
  sellerName: string;
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
};

export type BankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

/**
 * - "not_set_up": bank details saved, nothing created with the payment provider yet.
 * - "pending": the backend is verifying the bank account / creating the payout beneficiary.
 * - "active": the seller can be paid.
 * - "on_hold": payouts paused (e.g. a failed verification or a dispute).
 */
export type PayoutStatus = "not_set_up" | "pending" | "active" | "on_hold";

export type SellerPayout = {
  status: PayoutStatus;
  /** Provider-side id of the payout beneficiary / split account, if any. Display only. */
  reference: string | null;
  /** Free text such as "Fairsure" or "WokPay". Display only. */
  provider: string | null;
};

export type Seller = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  bank: BankDetails;
  /**
   * Payout set-up for this seller. Provider-neutral: the backend decides how sellers are paid
   * (Fairsure split/sub-merchant once available, or a payout/transfer product such as WokPay).
   */
  payout: SellerPayout;
  /**
   * - "pending": signed up, waiting for an admin to approve the store (listings stay hidden).
   * - "active": approved; approved listings are live.
   * - "rejected" / "suspended": store and listings hidden; `statusReason` says why.
   */
  status: SellerStatus;
  statusReason?: string;
  /** Public store profile (shown on /sellers/[id]). */
  bio?: string;
  /** Logo URL (data URL in mock mode). */
  logo?: string | null;
  /** When the seller accepted the seller terms at signup. */
  termsAcceptedAt?: string;
  createdAt: string;
};

export type SellerStatus = "pending" | "active" | "rejected" | "suspended";

/** What shoppers see on a seller's storefront (no contact or bank details). */
export type PublicSellerProfile = {
  id: string;
  businessName: string;
  bio: string;
  logo: string | null;
  createdAt: string;
};

export type SellerProfileInput = { businessName: string; bio: string; logo: string | null };

/** Quick edits a seller can make to a listing from the dashboard. Price/stock keep it live; a changed name/description sends a live or paused listing back to "pending". */
export type ListingUpdateInput = Partial<Pick<Product, "name" | "description" | "price" | "stock">>;

export type SellerSignupInput = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  bank: BankDetails;
  /** Must be true: the seller accepted the seller terms. */
  acceptTerms: boolean;
};

export type SellerSession = {
  token: string;
  seller: Seller;
};

export type AdminSession = {
  token: string;
  email: string;
  name: string;
};

/** What a seller submits from the "New listing" form. */
export type NewListingInput = {
  name: string;
  description: string;
  /** Required: one of the CATEGORIES slugs. */
  category: CategorySlug;
  /** Optional free-text detail, e.g. "Oversized shirt", "Ankara tote". */
  productType?: string;
  /** Optional. Omitted or "unisex" = not specified. */
  gender?: Gender;
  /** Optional Type choice shoppers pick from, e.g. { label: "Length", values: ["Short", "Long"] }. */
  typeOption?: ProductTypeOption | null;
  sizes: string[];
  colors: ColorVariant[];
  images: string[];
  price: number;
  stock: number;
  material?: string;
};

export type ProductFilters = {
  gender?: Gender | "all";
  category?: CategorySlug;
  search?: string;
  sellerId?: string;
  ids?: string[];
};

/** "processing" = paid and being prepared. */
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

/** Each seller fulfils their own lines of an order. */
export type FulfilmentStatus = "processing" | "shipped" | "delivered";

export type ShippingMethod = "standard" | "priority";
export type PaymentMethod = "card" | "transfer";

export type Customer = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Chosen Type value (e.g. "Long"), empty when the product has no Type option. */
  type?: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sellerId: string;
  sellerName: string;
  /** Commission % applied to this line (0 for the platform's own products). */
  commissionPercent: number;
  /** Platform commission on this line. */
  commissionAmount: number;
  /** What the seller receives for this line (lineTotal - commissionAmount). */
  sellerAmount: number;
};

/** Money owed to one seller inside an order (sum of that seller's lines). */
export type SellerSplit = {
  sellerId: string;
  sellerName: string;
  grossAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  /** Set by the seller as they prepare and ship their part of the order. */
  fulfilment?: FulfilmentStatus;
};

export type PaymentStatus = "unpaid" | "paid" | "failed";

export type Order = {
  id: string;
  /** Our unique order/payment reference. Sent to Fairsure as `ref` (Fairsure calls it merchant_reference). */
  reference: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  commissionTotal: number;
  sellerSplits: SellerSplit[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  /** Set by the backend after it verifies the payment with Fairsure. */
  paymentStatus?: PaymentStatus;
  /** Fairsure's own transaction reference (transaction_reference / transactionRef), once paid. */
  paymentReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

/** Line sent by the cart when creating an order. Prices are re-checked by the server. */
export type CreateOrderItemInput = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Chosen Type value (e.g. "Long"), empty when the product has no Type option. */
  type?: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
  sellerName: string;
};

export type CreateOrderInput = {
  customer: Customer;
  deliveryLocation?: { latitude: number; longitude: number } | null;
  items: CreateOrderItemInput[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  displayedSubtotal: number;
  displayedShipping: number;
  displayedTotal: number;
};

/**
 * What the server returns when checkout starts (POST /orders). The browser then opens the
 * Fairsure inline checkout with these values. Amounts are whole Naira.
 */
export type CheckoutInit = {
  orderId: string;
  /** Unique payment reference for this order, passed to Fairsure as `ref`. */
  ref: string;
  /** Amount to charge in Naira, computed by the server (never by the browser). */
  amount: number;
  currency: "NGN";
  /**
   * Fairsure PUBLIC key (TEST_… / LIVE_…). Optional: when null the frontend falls back to
   * NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY. Never the private key.
   */
  publicKey: string | null;
  /** Shown in the Fairsure modal, e.g. "Rebel Fashion order RF-261029-AB12C". */
  narration?: string;
  /** The created order (optional; the success page fetches it again anyway). */
  order?: Order;
};

/** @deprecated kept as an alias so older imports keep compiling. */
export type CreateOrderResult = CheckoutInit;

/** Result of asking the backend to verify a payment (POST /orders/:ref/confirm). */
export type PaymentConfirmation = {
  /** "paid" only when the server confirmed it with Fairsure (or the webhook already did). */
  status: "paid" | "pending" | "failed";
  order: Order | null;
  /** Optional human-readable note shown on the success page. */
  message?: string;
};

/** A seller's view of an order: only their own lines. */
export type SellerOrderView = {
  orderId: string;
  reference: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  city: string;
  state: string;
  items: OrderItem[];
  grossAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  /** This seller's fulfilment of their lines ("processing" until they update it). */
  fulfilment: FulfilmentStatus;
  /** Payment confirmed (the seller should only ship paid orders). */
  paid: boolean;
};

/** A shopper's product review. */
export type Review = {
  id: string;
  productId: string;
  name: string;
  /** 1–5 stars. */
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewInput = { name: string; rating: number; comment: string };

export type ReviewSummary = { average: number; count: number; reviews: Review[] };

export type ReportReason = "counterfeit" | "wrong_info" | "offensive" | "prohibited" | "scam" | "other";

export type ListingReport = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sellerId: string;
  sellerName: string;
  reason: ReportReason;
  details: string;
  /** Optional contact so the team can follow up. */
  email?: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type ReportInput = { reason: ReportReason; details: string; email?: string };

/** What a seller is owed and how their payouts stand (GET /admin/payouts). */
export type PayoutSummary = {
  sellerId: string;
  sellerName: string;
  bankName: string;
  /** Last 4 digits only. */
  accountLast4: string;
  payoutStatus: PayoutStatus;
  /** Seller share (90%) of paid, non-cancelled orders. */
  earned: number;
  /** Already transferred to the seller (from the backend's payout records). */
  paidOut: number;
  /** earned - paidOut. */
  balance: number;
};

/** Order lookup result for /track-order (no payment details). */
export type TrackedOrder = Pick<
  Order,
  "reference" | "status" | "createdAt" | "updatedAt" | "items" | "subtotal" | "shippingCost" | "total" | "shippingMethod" | "paymentStatus"
> & { city: string; state: string; fulfilment: { sellerName: string; status: FulfilmentStatus }[] };

/** One category with how many APPROVED products it has (GET /categories). */
export type CategorySummary = {
  slug: CategorySlug;
  name: string;
  productCount: number;
};

export type AdminOverview = {
  productCounts: { approved: number; pending: number; rejected: number; total: number };
  sellerCount: number;
  orderCount: number;
  /** Gross merchandise value: sum of order subtotals, excluding cancelled orders. */
  gmv: number;
  /** Platform commission earned on marketplace (third-party) sales, excluding cancelled. */
  commissionEarned: number;
  /** Revenue from the platform's own products, excluding cancelled. */
  ownStoreRevenue: number;
  /** Amount owed to / paid to sellers (their 90% share), excluding cancelled. */
  sellerPayouts: number;
  ordersByStatus: Record<OrderStatus, number>;
};
