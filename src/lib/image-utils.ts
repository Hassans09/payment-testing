/**
 * Pure helpers for listing photos (no DOM), kept separate so they can be unit-tested
 * in Node (see scripts/test-image-upload.mjs).
 */

/** Longest edge, in pixels, of a photo after client-side compression. */
export const MAX_IMAGE_EDGE = 1200;
/** WebP/JPEG quality used for compressed photos. */
export const JPEG_QUALITY = 0.8;
/** Files bigger than this are refused before we try to decode them (phones can choke). */
export const MAX_SOURCE_BYTES = 40 * 1024 * 1024;

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "avif", "bmp"];

type FileLike = { name: string; type: string; size: number };

function extension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/**
 * True for anything that looks like a photo. Some Android galleries and HEIC
 * files arrive with an empty `type`, so the file extension is checked too.
 */
export function isAcceptableImageFile(file: FileLike): boolean {
  if (file.type && file.type.startsWith("image/")) return true;
  if (!file.type || file.type === "application/octet-stream") return IMAGE_EXTENSIONS.includes(extension(file.name));
  return false;
}

/**
 * Value for <input type="file" accept>. Only MIME types on purpose: Chrome on Android maps
 * every extension through the OS MIME table, and one it doesn't know (".heic" on older
 * Android) turns the photo/camera picker into the generic file browser. HEIC photos still
 * match "image/*" on phones (their type is image/heic).
 */
export const PHOTO_ACCEPT = "image/*";

/** File extension for an encoded output MIME type. */
export function outputExtension(mimeType: string): string {
  return mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg";
}

/** Friendly message for a photo the browser couldn't decode, with a fix for the shopper's phone. */
export function unreadableImageMessage(name: string, heic: boolean, userAgent = ""): string {
  if (!heic) return `We couldn't open "${name}". Please try a different photo, or take a screenshot of it and upload that.`;
  if (/android/i.test(userAgent)) {
    return `"${name}" is a HEIC photo, which Chrome on Android can't open. Pick a JPG instead, or in your Camera settings turn off "High efficiency pictures" (Samsung) / HEIF, then take the photo again.`;
  }
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return `"${name}" is a HEIC photo this browser can't open. Pick it from Photos in Safari (it converts automatically), or set Settings → Camera → Formats → Most Compatible.`;
  }
  return `"${name}" is a HEIC photo this browser can't open. Please export it as JPG (or open it in Safari) and try again.`;
}

export function isHeicFile(file: FileLike): boolean {
  return /image\/hei[cf]/i.test(file.type) || ["heic", "heif"].includes(extension(file.name));
}

/** Scales width×height down (never up) so the longest edge is at most `max`. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: 1, height: 1 };
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Approximate decoded size in bytes of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

/** Returns a copy of `items` with the element at `from` moved to `to` (indices clamped). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const copy = [...items];
  if (from < 0 || from >= copy.length) return copy;
  const target = Math.max(0, Math.min(copy.length - 1, to));
  const [item] = copy.splice(from, 1);
  copy.splice(target, 0, item);
  return copy;
}

/** Splits typed text like "S, M,L  XL" into unique trimmed chips, keeping existing ones first. */
export function addChips(existing: readonly string[], typed: string): string[] {
  const parts = typed
    .split(/[,\n]/)
    .map((part) => part.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const result = [...existing];
  for (const part of parts) {
    if (!result.some((item) => item.toLowerCase() === part.toLowerCase())) result.push(part);
  }
  return result;
}

/** True when a thrown storage error means "quota exceeded" (names differ by browser). */
export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { name, code } = error as { name?: string; code?: number };
  return (
    code === 22 ||
    code === 1014 ||
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}
