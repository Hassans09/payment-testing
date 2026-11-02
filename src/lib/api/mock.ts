/**
 * MOCK implementation of the data API (default).
 *
 * Stores everything in the visitor's browser (localStorage) and starts from the
 * platform's own catalogue in src/lib/seed-data.ts (no demo sellers or orders). It behaves like a tiny backend so the whole
 * marketplace can be clicked through without a server:
 *   seller signs up -> submits listing (pending) -> admin approves -> it shows in /shop.
 *
 * Nothing here is secure: passwords are only lightly hashed and every visitor has
 * their own copy of the data. Replace with the real backend (http.ts) for production.
 */
import {
  ADMIN_DEMO_CREDENTIALS,
  MOCK_API_DELAY_MS,
  PLATFORM_SELLER_ID,
  SHIPPING_RATES,
  categoryName,
  isCategorySlug,
} from "@/lib/config";
import { readJSON, writeJSON } from "@/lib/client-storage";
import { buildSellerSplits, splitLine } from "@/lib/commission";
import { summarizeCategories } from "@/lib/categories";
import { slugify } from "@/lib/format";
import { compressImageToDataUrl, shrinkDataUrl } from "@/lib/image-compress";
import { SEED_VERSION, seedProducts } from "@/lib/seed-data";
import type {
  AdminOverview,
  AdminSession,
  CheckoutInit,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductFilters,
  Seller,
  SellerOrderView,
} from "@/lib/types";
import { ApiError, type DataApi } from "./contract";

const DB_KEY = "rf-mock-db";

type StoredSeller = Seller & { passwordHash: string };

type MockDb = {
  version: number;
  products: Product[];
  sellers: StoredSeller[];
  orders: Order[];
  sellerSession: { token: string; sellerId: string } | null;
  adminSession: AdminSession | null;
};

/** NOT real security — a quick string hash so demo passwords aren't stored as plain text. */
function weakHash(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return `mock$${(hash >>> 0).toString(16)}`;
}

function createSeedDb(): MockDb {
  return {
    version: SEED_VERSION,
    products: structuredClone(seedProducts),
    sellers: [],
    orders: [],
    sellerSession: null,
    adminSession: null,
  };
}

let serverDb: MockDb | null = null;

/** Upgrades demo data saved by older versions (sellers saved before the generic payout field existed). */
function migrateDb(db: MockDb): MockDb {
  for (const seller of db.sellers) {
    seller.payout ??= { status: "not_set_up", reference: null, provider: null };
  }
  for (const product of db.products) {
    // Products saved before categories existed: house items are kaftans, seller items "other".
    if (!isCategorySlug(product.category)) product.category = product.sellerId === PLATFORM_SELLER_ID ? "kaftans" : "other";
  }
  return db;
}

function loadDb(): MockDb {
  if (typeof window === "undefined") {
    serverDb ??= createSeedDb();
    return serverDb;
  }
  const stored = readJSON<MockDb | null>(DB_KEY, null);
  if (stored && stored.version === SEED_VERSION && Array.isArray(stored.products)) return migrateDb(stored);
  const fresh = createSeedDb();
  writeJSON(DB_KEY, fresh);
  return fresh;
}

const STORAGE_FULL_MESSAGE =
  "There isn't enough space on this device to save these photos. Remove a photo or two (or use smaller ones) and try again.";

function saveDb(db: MockDb) {
  if (typeof window === "undefined") {
    serverDb = db;
    return;
  }
  try {
    writeJSON(DB_KEY, db, "local", true);
  } catch {
    // setItem only throws when storage is full (QuotaExceededError) or blocked (private mode).
    throw new ApiError(STORAGE_FULL_MESSAGE, 507);
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_API_DELAY_MS));
}

function randomId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

function publicSeller(seller: StoredSeller): Seller {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = seller;
  return rest;
}

function matchesFilters(product: Product, filters: ProductFilters): boolean {
  if (filters.gender && filters.gender !== "all") {
    if (product.gender !== filters.gender && product.gender !== "unisex") return false;
  }
  if (filters.category && product.category !== filters.category) return false;
  if (filters.sellerId && product.sellerId !== filters.sellerId) return false;
  if (filters.ids && !filters.ids.includes(product.id)) return false;
  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    const haystack = [product.name, product.description, categoryName(product.category), product.productType, product.material, product.sellerName, ...product.colors.map((c) => c.name)]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
}

function newestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function requireSeller(db: MockDb): StoredSeller {
  const session = db.sellerSession;
  const seller = session ? db.sellers.find((item) => item.id === session.sellerId) : undefined;
  if (!seller) throw new ApiError("Please log in to your seller account.", 401);
  return seller;
}

function requireAdmin(db: MockDb): AdminSession {
  if (!db.adminSession) throw new ApiError("Admin login required.", 401);
  return db.adminSession;
}

function uniqueSlug(db: MockDb, name: string): string {
  const base = slugify(name) || "listing";
  let slug = base;
  let counter = 2;
  while (db.products.some((product) => product.slug === slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const mockApi: DataApi = {
  // ───────────── Catalogue ─────────────
  async getProducts(filters = {}) {
    const db = loadDb();
    const products = db.products.filter((product) => product.status === "approved" && matchesFilters(product, filters));
    return delay(products);
  },

  async getCategories() {
    const db = loadDb();
    return delay(summarizeCategories(db.products));
  },

  async getProduct(slugOrId) {
    const db = loadDb();
    const product = db.products.find(
      (item) => (item.slug === slugOrId || item.id === slugOrId) && item.status === "approved"
    );
    return delay(product ?? null);
  },

  // ───────────── Sellers ─────────────
  async createSeller(input) {
    const db = loadDb();
    const email = input.email.trim().toLowerCase();

    if (!input.businessName.trim() || !input.ownerName.trim()) throw new ApiError("Business and owner name are required.");
    if (!EMAIL_PATTERN.test(email)) throw new ApiError("Please enter a valid email address.");
    if (input.password.length < 8) throw new ApiError("Password must be at least 8 characters.");
    if (!/^\d{10}$/.test(input.bank.accountNumber)) throw new ApiError("Account number must be 10 digits (NUBAN).");
    if (db.sellers.some((seller) => seller.email === email)) throw new ApiError("An account with this email already exists.", 409);

    const seller: StoredSeller = {
      id: randomId("sel"),
      businessName: input.businessName.trim(),
      ownerName: input.ownerName.trim(),
      email,
      phone: input.phone.trim(),
      bank: {
        bankName: input.bank.bankName.trim(),
        accountNumber: input.bank.accountNumber.trim(),
        accountName: input.bank.accountName.trim(),
      },
      payout: { status: "not_set_up", reference: null, provider: null },
      status: "active",
      createdAt: new Date().toISOString(),
      passwordHash: weakHash(input.password),
    };

    const token = randomId("tok");
    db.sellers.push(seller);
    db.sellerSession = { token, sellerId: seller.id };
    saveDb(db);
    return delay({ token, seller: publicSeller(seller) });
  },

  async loginSeller(email, password) {
    const db = loadDb();
    const seller = db.sellers.find((item) => item.email === email.trim().toLowerCase());
    if (!seller || seller.passwordHash !== weakHash(password)) {
      await delay(null);
      throw new ApiError("Incorrect email or password.", 401);
    }
    const token = randomId("tok");
    db.sellerSession = { token, sellerId: seller.id };
    saveDb(db);
    return delay({ token, seller: publicSeller(seller) });
  },

  async logoutSeller() {
    const db = loadDb();
    db.sellerSession = null;
    saveDb(db);
    return delay(undefined);
  },

  async getCurrentSeller() {
    const db = loadDb();
    const session = db.sellerSession;
    const seller = session ? db.sellers.find((item) => item.id === session.sellerId) : undefined;
    return delay(seller ? publicSeller(seller) : null);
  },

  async getSellerListings() {
    const db = loadDb();
    const seller = requireSeller(db);
    return delay(newestFirst(db.products.filter((product) => product.sellerId === seller.id)));
  },

  async createListing(input) {
    const db = loadDb();
    const seller = requireSeller(db);

    if (!input.name.trim()) throw new ApiError("Please add a title.");
    if (input.images.length === 0) throw new ApiError("Please add at least one photo.");
    if (!(input.price > 0)) throw new ApiError("Please enter a price.");
    if (!isCategorySlug(input.category)) throw new ApiError("Please choose a category.");
    if (input.sizes.length === 0) throw new ApiError("Please add at least one size.");
    if (input.colors.length === 0) throw new ApiError("Please add at least one colour.");

    const now = new Date().toISOString();
    const slug = uniqueSlug(db, input.name);
    const product: Product = {
      id: randomId("prd"),
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      productType: (input.productType ?? "").trim(),
      gender: input.gender ?? "unisex",
      typeOption:
        input.typeOption && input.typeOption.values.length > 0
          ? { label: input.typeOption.label.trim() || "Type", values: input.typeOption.values }
          : null,
      price: Math.round(input.price),
      images: input.images,
      colors: input.colors,
      sizes: input.sizes,
      stock: Math.max(0, Math.round(input.stock)),
      material: input.material?.trim() || "See description",
      fit: "See description",
      care: "Follow the seller's care label.",
      sellerId: seller.id,
      sellerName: seller.businessName,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    db.products.push(product);
    try {
      saveDb(db);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 507) throw error;
      // Browser storage is nearly full: shrink this listing's photos once and retry.
      const shrink = (url: string) => shrinkDataUrl(url, 800, 0.7).catch(() => url);
      product.images = await Promise.all(product.images.map(shrink));
      product.colors = await Promise.all(
        product.colors.map(async (color) => (color.image ? { ...color, image: await shrink(color.image) } : color))
      );
      saveDb(db); // throws the friendly "not enough space" error if it still doesn't fit
    }
    return delay(product);
  },

  async uploadListingImage(file) {
    // In mock mode photos are compressed (max 1200px JPEG) and kept as data URLs in localStorage.
    return compressImageToDataUrl(file);
  },

  async getSellerOrders() {
    const db = loadDb();
    const seller = requireSeller(db);
    const views: SellerOrderView[] = [];

    for (const order of newestFirst(db.orders)) {
      const items = order.items.filter((item) => item.sellerId === seller.id);
      if (items.length === 0) continue;
      views.push({
        orderId: order.id,
        reference: order.reference,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.customer.fullName,
        city: order.customer.city,
        state: order.customer.state,
        items,
        grossAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
        commissionAmount: items.reduce((sum, item) => sum + item.commissionAmount, 0),
        sellerAmount: items.reduce((sum, item) => sum + item.sellerAmount, 0),
      });
    }

    return delay(views);
  },

  // ───────────── Admin ─────────────
  async loginAdmin(email, password) {
    const db = loadDb();
    if (email.trim().toLowerCase() !== ADMIN_DEMO_CREDENTIALS.email || password !== ADMIN_DEMO_CREDENTIALS.password) {
      await delay(null);
      throw new ApiError("Incorrect admin email or password.", 401);
    }
    const session: AdminSession = {
      token: randomId("adm"),
      email: ADMIN_DEMO_CREDENTIALS.email,
      name: ADMIN_DEMO_CREDENTIALS.name,
    };
    db.adminSession = session;
    saveDb(db);
    return delay(session);
  },

  async logoutAdmin() {
    const db = loadDb();
    db.adminSession = null;
    saveDb(db);
    return delay(undefined);
  },

  async getAdminSession() {
    return delay(loadDb().adminSession);
  },

  async getPendingListings() {
    const db = loadDb();
    requireAdmin(db);
    return delay(newestFirst(db.products.filter((product) => product.status === "pending")));
  },

  async getAllProducts() {
    const db = loadDb();
    requireAdmin(db);
    return delay(newestFirst(db.products));
  },

  async approveListing(productId) {
    const db = loadDb();
    requireAdmin(db);
    const product = db.products.find((item) => item.id === productId);
    if (!product) throw new ApiError("Listing not found.", 404);

    product.status = "approved";
    product.rejectionReason = undefined;
    product.updatedAt = new Date().toISOString();

    // The real backend sets up the seller's payout beneficiary around this point (verify the
    // bank account, register it for payouts). The mock just marks payouts as active.
    const seller = db.sellers.find((item) => item.id === product.sellerId);
    if (seller && seller.payout.status === "not_set_up") {
      seller.payout = { status: "active", reference: `PAYOUT_mock_${seller.id.slice(-6)}`, provider: "Demo" };
    }

    saveDb(db);
    return delay(product);
  },

  async rejectListing(productId, reason) {
    const db = loadDb();
    requireAdmin(db);
    const product = db.products.find((item) => item.id === productId);
    if (!product) throw new ApiError("Listing not found.", 404);
    if (!reason.trim()) throw new ApiError("Please give the seller a reason.");

    product.status = "rejected";
    product.rejectionReason = reason.trim();
    product.updatedAt = new Date().toISOString();
    saveDb(db);
    return delay(product);
  },

  async getSellers() {
    const db = loadDb();
    requireAdmin(db);
    return delay(newestFirst(db.sellers.map(publicSeller)));
  },

  async getOrders() {
    const db = loadDb();
    requireAdmin(db);
    return delay(newestFirst(db.orders));
  },

  async updateOrderStatus(orderId, status) {
    const db = loadDb();
    requireAdmin(db);
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) throw new ApiError("Order not found.", 404);
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveDb(db);
    return delay(order);
  },

  async getAdminOverview() {
    const db = loadDb();
    requireAdmin(db);

    const ordersByStatus: Record<OrderStatus, number> = { pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 };
    let gmv = 0;
    let commissionEarned = 0;
    let ownStoreRevenue = 0;
    let sellerPayouts = 0;

    for (const order of db.orders) {
      ordersByStatus[order.status] += 1;
      if (order.status === "cancelled") continue;
      gmv += order.subtotal;
      for (const item of order.items) {
        if (item.sellerId === PLATFORM_SELLER_ID) {
          ownStoreRevenue += item.lineTotal;
        } else {
          commissionEarned += item.commissionAmount;
          sellerPayouts += item.sellerAmount;
        }
      }
    }

    const overview: AdminOverview = {
      productCounts: {
        approved: db.products.filter((p) => p.status === "approved").length,
        pending: db.products.filter((p) => p.status === "pending").length,
        rejected: db.products.filter((p) => p.status === "rejected").length,
        total: db.products.length,
      },
      sellerCount: db.sellers.length,
      orderCount: db.orders.length,
      gmv,
      commissionEarned,
      ownStoreRevenue,
      sellerPayouts,
      ordersByStatus,
    };
    return delay(overview);
  },

  // ───────────── Orders ─────────────
  async createOrder(input) {
    const db = loadDb();

    // Re-price every line from the "database", never from the cart.
    const items: OrderItem[] = input.items.map((line) => {
      const product = db.products.find((item) => item.id === line.productId);
      if (!product || product.status !== "approved") {
        throw new ApiError(`"${line.name}" is no longer available. Please remove it from your bag.`, 409);
      }
      const quantity = Math.max(1, Math.min(99, Math.round(line.quantity)));
      const split = splitLine(product.price, quantity, product.sellerId);
      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: line.image || product.images[0],
        type: line.type ?? "",
        color: line.color,
        size: line.size,
        quantity,
        unitPrice: product.price,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        ...split,
      };
    });

    if (items.length === 0) throw new ApiError("Your bag is empty.");

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingCost = SHIPPING_RATES[input.shippingMethod] ?? SHIPPING_RATES.standard;

    // The mock checkout route (/api/checkout) re-validates totals and returns the same
    // checkout-init shape the real backend returns: { orderId, ref, amount, publicKey }.
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sellerId: item.sellerId,
        })),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as Partial<CheckoutInit> & { error?: string };
    if (!response.ok || !data.ref || !data.orderId || typeof data.amount !== "number") {
      throw new ApiError(data.error || "We couldn't start the payment. Please try again.", response.status || 500);
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: data.orderId,
      reference: data.ref,
      customer: input.customer,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      commissionTotal: items.reduce((sum, item) => sum + item.commissionAmount, 0),
      sellerSplits: buildSellerSplits(items),
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod,
      // Stays "pending" until confirmPayment() (the real backend: until Fairsure verifies it).
      status: "pending",
      paymentStatus: "unpaid",
      paymentReference: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    };

    db.orders.push(order);
    saveDb(db);
    return delay({
      orderId: order.id,
      ref: order.reference,
      amount: data.amount,
      currency: "NGN" as const,
      publicKey: data.publicKey ?? null,
      narration: data.narration,
      order,
    });
  },

  async confirmPayment(ref, transactionRef) {
    // DEMO ONLY: there is no private key in the browser, so the mock cannot ask Fairsure.
    // It trusts the redirect and marks the order paid. The real backend MUST verify with
    // GET {base}/api/v1/transactions/{ref} (or rely on the signed webhook) instead.
    const db = loadDb();
    const order = db.orders.find((item) => item.reference === ref);
    if (!order) return delay({ status: "pending" as const, order: null, message: "We couldn't find this order in this browser." });

    if (order.paymentStatus !== "paid") {
      const now = new Date().toISOString();
      order.paymentStatus = "paid";
      order.paymentReference = transactionRef ?? order.paymentReference ?? null;
      order.paidAt = now;
      if (order.status === "pending") order.status = "paid";
      order.updatedAt = now;
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock = Math.max(0, product.stock - item.quantity);
      }
      saveDb(db);
    }
    return delay({ status: "paid" as const, order, message: "Demo store: payment marked as paid without a server check." });
  },

  async getOrderByReference(reference) {
    const db = loadDb();
    return delay(db.orders.find((order) => order.reference === reference) ?? null);
  },
};
