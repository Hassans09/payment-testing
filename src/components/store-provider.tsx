
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

import { type Product } from "@/lib/store-data";

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

type AddToCartInput = {
  product: Product;
  color?: string;
  size?: string;
  quantity?: number;
};

type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (input: AddToCartInput, openDrawer?: boolean) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearCart: () => void;
};

const cartStorageKey = "storefront-cart-v1";
const wishlistStorageKey = "storefront-wishlist-v1";

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

let cartMemory: CartItem[] = [];
let wishlistMemory: string[] = [];
let initialized = false;

const storeListeners = new Set<() => void>();

function notifyStoreChange() {
  storeListeners.forEach((listener) => listener());
}

function initMemoryStore() {
  if (initialized || typeof window === "undefined") return;

  try {
    const savedCart = parseStoredValue<CartItem[]>(
      localStorage.getItem(cartStorageKey),
      []
    );
    const savedWishlist = parseStoredValue<string[]>(
      localStorage.getItem(wishlistStorageKey),
      []
    );

    if (Array.isArray(savedCart)) cartMemory = savedCart;
    if (Array.isArray(savedWishlist)) wishlistMemory = savedWishlist;
  } catch {
    // Continue with in-memory data if storage is unavailable.
  }

  initialized = true;
}

function subscribeStore(listener: () => void) {
  storeListeners.add(listener);

  return () => {
    storeListeners.delete(listener);
  };
}

function getCartSnapshot(): CartItem[] {
  initMemoryStore();
  return cartMemory;
}

function getWishlistSnapshot(): string[] {
  initMemoryStore();
  return wishlistMemory;
}

const emptyCartArray: CartItem[] = [];
const emptyWishlistArray: string[] = [];

function getServerCartSnapshot(): CartItem[] {
  return emptyCartArray;
}

function getServerWishlistSnapshot(): string[] {
  return emptyWishlistArray;
}

function mutateCart(updater: (previous: CartItem[]) => CartItem[]) {
  initMemoryStore();
  cartMemory = updater(cartMemory);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cartMemory));
    } catch {
      // Cart remains available in memory if storage is unavailable.
    }
  }

  notifyStoreChange();
}

function mutateWishlist(updater: (previous: string[]) => string[]) {
  initMemoryStore();
  wishlistMemory = updater(wishlistMemory);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        wishlistStorageKey,
        JSON.stringify(wishlistMemory)
      );
    } catch {
      // Wishlist remains available in memory if storage is unavailable.
    }
  }

  notifyStoreChange();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState<string | null>(
    null
  );

  const cart = useSyncExternalStore(
    subscribeStore,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const wishlist = useSyncExternalStore(
    subscribeStore,
    getWishlistSnapshot,
    getServerWishlistSnapshot
  );

  useEffect(() => {
    if (!addedProductName) return;

    const timeout = window.setTimeout(() => {
      setAddedProductName(null);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [addedProductName]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(
    () => setIsCartOpen((previous) => !previous),
    []
  );

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = useCallback(
    (
      { product, color, size, quantity = 1 }: AddToCartInput,
      openDrawer = true
    ) => {
      const safeQuantity = Number.isFinite(quantity)
        ? Math.max(1, Math.min(quantity, 99))
        : 1;

      const selectedColor =
        product.colors.length > 0 ? (color ?? product.colors[0]) : "";

      const selectedSize =
        product.sizes.length > 0 ? (size ?? product.sizes[0]) : "";

      mutateCart((previous) => {
        const existingItem = previous.find(
          (item) =>
            item.productId === product.id &&
            item.color === selectedColor &&
            item.size === selectedSize
        );

        if (existingItem) {
          return previous.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + safeQuantity, 99),
                }
              : item
          );
        }

        const newItem: CartItem = {
          id: `${product.id}-${selectedColor}-${selectedSize}`,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          price: product.price,
          color: selectedColor,
          size: selectedSize,
          quantity: safeQuantity,
        };

        return [...previous, newItem];
      });

      if (openDrawer) {
        setIsCartOpen(true);
        setAddedProductName(null);
      } else {
        setAddedProductName(product.name);
      }
    },
    []
  );

  const updateCartQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const safeQuantity = Math.max(1, Math.min(quantity, 99));

      mutateCart((previous) =>
        previous.map((item) =>
          item.id === itemId
            ? { ...item, quantity: safeQuantity }
            : item
        )
      );
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    mutateCart((previous) =>
      previous.filter((item) => item.id !== itemId)
    );
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    mutateWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const clearCart = useCallback(() => {
    mutateCart(() => []);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      itemCount,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      toggleWishlist,
      isWishlisted,
      clearCart,
    }),
    [
      cart,
      wishlist,
      itemCount,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      toggleWishlist,
      isWishlisted,
      clearCart,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}

      {addedProductName && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-4 right-4 z-[100] mx-auto max-w-md animate-in slide-in-from-bottom-3 duration-300 sm:bottom-6 sm:left-auto sm:right-6"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 shadow-[0_16px_50px_rgba(61,43,34,0.18)]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
                Added to your bag!
              </p>

              <p className="mt-1 truncate text-xs text-[color:var(--brand-charcoal)]/70">
                {addedProductName}
              </p>

              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                Keep exploring, or view your bag when you’re ready.
              </p>

              <Link
                href="/cart"
                onClick={() => setAddedProductName(null)}
                className="mt-3 inline-flex items-center rounded-full bg-[color:var(--brand-deep)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary)]"
              >
                View Bag ({itemCount})
              </Link>
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setAddedProductName(null)}
              className="rounded-full p-1 text-[color:var(--brand-charcoal)]/60 transition hover:bg-[color:var(--brand-ivory)] hover:text-[color:var(--brand-deep)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}
