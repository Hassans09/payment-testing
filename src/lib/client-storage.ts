/**
 * Tiny safe wrappers around localStorage / sessionStorage.
 * They never throw (private mode, quota, SSR) unless `throwOnQuota` is set.
 */

type StorageKind = "local" | "session";

function getStore(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T, kind: StorageKind = "local"): T {
  const store = getStore(kind);
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, kind: StorageKind = "local", throwOnQuota = false) {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (throwOnQuota) throw error;
  }
}

export function readString(key: string, kind: StorageKind = "local"): string | null {
  const store = getStore(kind);
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string, kind: StorageKind = "local") {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeKey(key: string, kind: StorageKind = "local") {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // ignore
  }
}
