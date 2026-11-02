/**
 * Browser-only: turns a photo picked from a phone gallery or computer into a small
 * compressed image (max 1200px on the longest edge): WebP where the browser can encode it
 * (Chrome, Android, Edge, Firefox), JPEG otherwise (older Safari).
 *
 * Phone photos are big (12–108 MP). Decoding one at full size costs 4 bytes per pixel
 * (a 50 MP photo is ~200 MB of memory), which on mid/low-end Android phones gets the tab
 * killed: Chrome backgrounds the page while the photo picker is open, then reloads it
 * when the picker closes, and the chosen photos (and the form) are gone. So we:
 *   1. read the photo's size cheaply from an <img> (no pixel decode, EXIF orientation applied),
 *   2. decode it straight to the target size with createImageBitmap(resizeWidth/resizeHeight),
 *      which never holds the full-resolution bitmap,
 * and only fall back to a full decode (createImageBitmap, <img> + object URL, <img> + FileReader)
 * when that isn't supported. Every step has a timeout so a stuck decode can't hang the form.
 *
 * Used by the mock API so listing photos fit in localStorage, and by the http API so phones
 * upload ~200 KB instead of 5–15 MB (see BACKEND.md, uploadListingImage).
 */
import {
  fitWithin,
  isAcceptableImageFile,
  isHeicFile,
  JPEG_QUALITY,
  MAX_IMAGE_EDGE,
  MAX_SOURCE_BYTES,
  outputExtension,
  unreadableImageMessage,
} from "@/lib/image-utils";

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

/** Gives up on a decode step after this long (very slow phones still finish well inside it). */
const DECODE_TIMEOUT_MS = 25000;

function withTimeout<T>(promise: Promise<T>, ms = DECODE_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return withTimeout(
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("decode failed"));
      image.src = src;
    })
  );
}

function readAsDataUrl(file: Blob): Promise<string> {
  return withTimeout(
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error("read failed"));
      reader.readAsDataURL(file);
    })
  );
}

/**
 * Width and height as displayed (EXIF orientation applied), without decoding the pixels:
 * browsers only parse the header to fire `load`; the bitmap is decoded when drawn.
 */
async function readDisplaySize(file: Blob): Promise<{ width: number; height: number } | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    return image.naturalWidth > 0 && image.naturalHeight > 0
      ? { width: image.naturalWidth, height: image.naturalHeight }
      : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Decodes straight to the target size (low memory). Null when the browser can't. */
async function decodeResized(file: Blob, maxSize: number): Promise<Decoded | null> {
  if (typeof window.createImageBitmap !== "function") return null;
  const size = await readDisplaySize(file);
  if (!size) return null;
  const target = fitWithin(size.width, size.height, maxSize);
  try {
    const bitmap = await withTimeout(
      window.createImageBitmap(file, {
        imageOrientation: "from-image",
        resizeWidth: target.width,
        resizeHeight: target.height,
        resizeQuality: "high",
      })
    );
    // Browsers that ignore the resize options return the full-size bitmap: still usable.
    if (bitmap.width > 0 && bitmap.height > 0) {
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    }
    bitmap.close();
  } catch {
    // fall through to a full decode
  }
  return null;
}

async function decodeFull(file: Blob): Promise<Decoded> {
  // 1. createImageBitmap
  if (typeof window.createImageBitmap === "function") {
    try {
      let bitmap: ImageBitmap;
      try {
        bitmap = await withTimeout(window.createImageBitmap(file, { imageOrientation: "from-image" }));
      } catch {
        bitmap = await withTimeout(window.createImageBitmap(file)); // older Safari rejects the options bag
      }
      if (bitmap.width > 0 && bitmap.height > 0) {
        return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
      }
      bitmap.close();
    } catch {
      // fall through
    }
  }

  // 2. <img> + object URL
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    if (image.naturalWidth > 0) {
      return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(objectUrl) };
    }
  } catch {
    // fall through
  }
  URL.revokeObjectURL(objectUrl);

  // 3. <img> + FileReader data URL
  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => undefined };
}

async function decode(file: Blob, maxSize: number): Promise<Decoded> {
  return (await decodeResized(file, maxSize)) ?? decodeFull(file);
}

function fileMeta(file: File | Blob) {
  return { name: "name" in file && file.name ? file.name : "photo", type: file.type, size: file.size };
}

/** Validates, decodes and draws the photo onto a white canvas no larger than maxSize. */
async function drawToCanvas(file: File | Blob, maxSize: number): Promise<HTMLCanvasElement> {
  const meta = fileMeta(file);
  if (!isAcceptableImageFile(meta)) {
    throw new Error(`"${meta.name}" isn't a photo. Please choose a JPG, PNG or WEBP image.`);
  }
  if (meta.size > MAX_SOURCE_BYTES) {
    throw new Error(`"${meta.name}" is too large (over 40 MB). Please choose a smaller photo.`);
  }

  let decoded: Decoded;
  try {
    decoded = await decode(file, maxSize);
  } catch {
    throw new Error(unreadableImageMessage(meta.name, isHeicFile(meta), navigator.userAgent));
  }

  try {
    const { width, height } = fitWithin(decoded.width, decoded.height, maxSize);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser can't process photos. Please try another browser.");

    context.fillStyle = "#ffffff"; // transparent PNGs get a white background, not black
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);
    return canvas;
  } finally {
    decoded.release();
  }
}

/** Frees canvas memory quickly on phones. */
function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/** Any decodable photo -> compressed WebP/JPEG data URL, at most maxSize px on its longest edge. */
export async function compressImageToDataUrl(
  file: File | Blob,
  maxSize = MAX_IMAGE_EDGE,
  quality = JPEG_QUALITY
): Promise<string> {
  const canvas = await drawToCanvas(file, maxSize);
  try {
    // WebP is ~30% smaller than JPEG at the same quality; browsers that can't encode it
    // (older Safari) silently return PNG, so check and fall back to JPEG.
    let dataUrl = canvas.toDataURL("image/webp", quality);
    if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (!dataUrl.startsWith("data:image/")) {
      throw new Error(`We couldn't process "${fileMeta(file).name}". Please try a different photo.`);
    }
    return dataUrl;
  } finally {
    releaseCanvas(canvas);
  }
}

/** Same as compressImageToDataUrl, as a File ready for a multipart upload (http API). */
export async function compressImageToFile(
  file: File | Blob,
  maxSize = MAX_IMAGE_EDGE,
  quality = JPEG_QUALITY
): Promise<File> {
  const canvas = await drawToCanvas(file, maxSize);
  try {
    const toBlob = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    let blob = await toBlob("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
    if (!blob) throw new Error(`We couldn't process "${fileMeta(file).name}". Please try a different photo.`);
    const base = fileMeta(file).name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.${outputExtension(blob.type)}`, { type: blob.type });
  } finally {
    releaseCanvas(canvas);
  }
}

/** Re-compresses an existing data URL smaller (used when browser storage is nearly full). */
export async function shrinkDataUrl(dataUrl: string, maxSize: number, quality: number): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) return dataUrl;
  const blob = await (await fetch(dataUrl)).blob();
  return compressImageToDataUrl(blob, maxSize, quality);
}
