"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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

const cartStorageKey = "rebel-fashion-cart-v1";
const wishlistStorageKey = "rebel-fashion-wishlist-v1";

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

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
    const savedCart = parseStoredValue<CartItem[]>(localStorage.getItem(cartStorageKey), []);
    const savedWishlist = parseStoredValue<string[]>(localStorage.getItem(wishlistStorageKey), []);
    if (Array.isArray(savedCart)) cartMemory = savedCart;
    if (Array.isArray(savedWishlist)) wishlistMemory = savedWishlist;
  } catch {
    // ignore
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
      // ignore
    }
  }
  notifyStoreChange();
}

function mutateWishlist(updater: (previous: string[]) => string[]) {
  initMemoryStore();
  wishlistMemory = updater(wishlistMemory);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlistMemory));
    } catch {
      // ignore
    }
  }
  notifyStoreChange();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useSyncExternalStore(subscribeStore, getCartSnapshot, getServerCartSnapshot);
  const wishlist = useSyncExternalStore(subscribeStore, getWishlistSnapshot, getServerWishlistSnapshot);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const addToCart = useCallback(({ product, color, size, quantity = 1 }: AddToCartInput, openDrawer = true) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
    const selectedColor = product.colors.length > 0 ? (color ?? product.colors[0]) : "";
    const selectedSize = product.sizes.length > 0 ? (size ?? product.sizes[0]) : "";

    mutateCart((previous) => {
      const existingItem = previous.find(
        (item) => item.productId === product.id && item.color === selectedColor && item.size === selectedSize,
      );

      if (existingItem) {
        return previous.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: Math.min(item.quantity + safeQuantity, 99) }
            : item,
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
    }
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(quantity, 99));
    mutateCart((previous) =>
      previous.map((item) => (item.id === itemId ? { ...item, quantity: safeQuantity } : item)),
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    mutateCart((previous) => previous.filter((item) => item.id !== itemId));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    mutateWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

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
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}
