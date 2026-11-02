/**
 * Tests for the listing-photo pipeline (no browser needed).
 * Run: npm run test:images
 *
 * Covers the pure helpers in src/lib/image-utils.ts and the decode → canvas → JPEG
 * flow in src/lib/image-compress.ts with a faked DOM (createImageBitmap, <img>,
 * FileReader, canvas), including the HEIC and fallback paths.
 */
import assert from "node:assert/strict";
import test from "node:test";

const utils = await import("@/lib/image-utils");

test("accepts photos by MIME type or by extension when type is missing", () => {
  assert.equal(utils.isAcceptableImageFile({ name: "a.jpg", type: "image/jpeg", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "IMG_0001.HEIC", type: "", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "photo.heif", type: "application/octet-stream", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "x.png", type: "image/png", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "doc.pdf", type: "application/pdf", size: 1 }), false);
  assert.equal(utils.isAcceptableImageFile({ name: "noext", type: "", size: 1 }), false);
});

test("detects HEIC", () => {
  assert.equal(utils.isHeicFile({ name: "a.heic", type: "", size: 1 }), true);
  assert.equal(utils.isHeicFile({ name: "a", type: "image/heif", size: 1 }), true);
  assert.equal(utils.isHeicFile({ name: "a.jpg", type: "image/jpeg", size: 1 }), false);
});

test("fitWithin scales down to 1200px longest edge and never up", () => {
  assert.deepEqual(utils.fitWithin(4032, 3024, 1200), { width: 1200, height: 900 });
  assert.deepEqual(utils.fitWithin(3024, 4032, 1200), { width: 900, height: 1200 });
  assert.deepEqual(utils.fitWithin(800, 600, 1200), { width: 800, height: 600 });
  assert.deepEqual(utils.fitWithin(0, 0, 1200), { width: 1, height: 1 });
});

test("moveItem reorders and clamps", () => {
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 1, 99), ["a", "c", "b"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 5, 0), ["a", "b", "c"]);
});

test("addChips splits, trims and de-duplicates case-insensitively", () => {
  assert.deepEqual(utils.addChips(["M"], "s, m ,L,,  xl "), ["M", "s", "L", "xl"]);
  assert.deepEqual(utils.addChips([], "One   size"), ["One size"]);
});

test("dataUrlBytes estimates size", () => {
  assert.equal(utils.dataUrlBytes("data:image/jpeg;base64,QUJD"), 3);
  assert.equal(utils.dataUrlBytes("data:image/jpeg;base64,QUI="), 2);
});

test("isQuotaError recognises browser quota errors", () => {
  assert.equal(utils.isQuotaError({ name: "QuotaExceededError" }), true);
  assert.equal(utils.isQuotaError({ code: 22 }), true);
  assert.equal(utils.isQuotaError(new Error("x")), false);
});

// ───────── Fake DOM for image-compress.ts ─────────

const calls = {};
function installDom({ bitmap = "ok", img = "ok", reader = "ok", width = 4032, height = 3024, webp = false } = {}) {
  for (const key of Object.keys(calls)) delete calls[key];
  calls.revoked = 0;
  calls.closed = 0;

  class FakeImage {
    constructor() {
      this.naturalWidth = 0;
      this.naturalHeight = 0;
    }
    set src(value) {
      this._src = value;
      const mode = value.startsWith("blob:") ? img : reader === "ok" && value.startsWith("data:") ? "ok" : "fail";
      queueMicrotask(() => {
        if (mode === "ok") {
          this.naturalWidth = width;
          this.naturalHeight = height;
          calls.imgSrc = value;
          this.onload?.();
        } else {
          this.onerror?.();
        }
      });
    }
  }

  const win = {
    Image: FakeImage,
    setTimeout: (...args) => globalThis.setTimeout(...args),
    clearTimeout: (id) => globalThis.clearTimeout(id),
    createImageBitmap:
      bitmap === "missing"
        ? undefined
        : async (_file, options) => {
            calls.bitmapOptions = options;
            if (bitmap === "fail") throw new Error("unsupported");
            if (bitmap === "no-options" && options) throw new TypeError("options not supported");
            // Real browsers honour resizeWidth/resizeHeight (decode straight to the small size).
            const w = bitmap === "ignores-resize" ? width : options?.resizeWidth ?? width;
            const h = bitmap === "ignores-resize" ? height : options?.resizeHeight ?? height;
            return { width: w, height: h, close: () => (calls.closed += 1) };
          },
  };
  globalThis.window = win;
  globalThis.document = {
    createElement: (tag) => {
      assert.equal(tag, "canvas");
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
          fillRect: () => {},
          drawImage: (_src, x, y, w, h) => (calls.drawn = { x, y, w, h }),
          set fillStyle(v) { calls.fill = v; },
          set imageSmoothingQuality(_v) {},
        }),
        toDataURL: (type, quality) => {
          calls.toDataURL = { type, quality, width: canvas.width, height: canvas.height };
          // Like Safari < 17: an unsupported type silently comes back as PNG.
          if (type === "image/webp") return webp ? "data:image/webp;base64,UklG" : "data:image/png;base64,iVBO";
          return "data:image/jpeg;base64,/9j/AAAA";
        },
        toBlob: (callback, type, quality) => {
          calls.toBlob = { type, quality, width: canvas.width, height: canvas.height };
          const outType = type === "image/webp" && !webp ? "image/png" : type;
          queueMicrotask(() => callback(new Blob(["x"], { type: outType })));
        },
      };
      return canvas;
    },
  };
  globalThis.URL.createObjectURL = () => "blob:fake";
  globalThis.URL.revokeObjectURL = () => (calls.revoked += 1);
  globalThis.FileReader = class {
    readAsDataURL() {
      queueMicrotask(() => {
        if (reader === "ok") {
          this.result = "data:image/jpeg;base64,AAAA";
          this.onload?.();
        } else {
          this.error = new Error("read failed");
          this.onerror?.();
        }
      });
    }
  };
}

const { compressImageToDataUrl, compressImageToFile } = await import("@/lib/image-compress");
// A Blob that looks like a picked File with a chosen name and size (Blob.size is read-only).
function file(name, type, size = 3_000_000) {
  const blob = new Blob(["x"], { type });
  return new Proxy(blob, {
    get(target, prop) {
      if (prop === "size") return size;
      if (prop === "name") return name;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    has(target, prop) {
      return prop === "name" || prop in target;
    },
  });
}

test("large phone JPEG is decoded straight to 1200px (low memory), JPEG fallback when WebP can't be encoded", async () => {
  installDom();
  const url = await compressImageToDataUrl(file("IMG_1.jpg", "image/jpeg", 9_000_000));
  assert.match(url, /^data:image\/jpeg/);
  assert.equal(calls.toDataURL.type, "image/jpeg");
  assert.equal(calls.toDataURL.quality, 0.8);
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1200, h: 900 });
  assert.deepEqual(calls.bitmapOptions, {
    imageOrientation: "from-image",
    resizeWidth: 1200,
    resizeHeight: 900,
    resizeQuality: "high",
  });
  assert.equal(calls.closed, 1, "bitmap is released");
  assert.equal(calls.revoked, 1, "size-probe object URL is released");
  assert.equal(calls.fill, "#ffffff", "transparent areas become white");
});

test("WebP is used when the browser can encode it (Chrome / Android)", async () => {
  installDom({ webp: true });
  const url = await compressImageToDataUrl(file("IMG_2.jpg", "image/jpeg"));
  assert.match(url, /^data:image\/webp/);
  assert.equal(calls.toDataURL.type, "image/webp");
});

test("50 MP photo: never asks for a full-size bitmap", async () => {
  installDom({ width: 8160, height: 6120 });
  await compressImageToDataUrl(file("big.jpg", "image/jpeg", 20_000_000));
  assert.equal(calls.bitmapOptions.resizeWidth, 1200);
  assert.equal(calls.bitmapOptions.resizeHeight, 900);
});

test("browser that ignores the resize options: full bitmap is scaled on the canvas", async () => {
  installDom({ bitmap: "ignores-resize", width: 3000, height: 4000 });
  await compressImageToDataUrl(file("p.jpg", "image/jpeg"));
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 900, h: 1200 });
});

test("compressImageToFile returns a small named File for multipart uploads", async () => {
  installDom({ webp: true });
  const out = await compressImageToFile(file("IMG_3.JPG", "image/jpeg", 9_000_000));
  assert.equal(out.name, "IMG_3.webp");
  assert.equal(out.type, "image/webp");
  assert.deepEqual([calls.toBlob.width, calls.toBlob.height], [1200, 900]);
  installDom();
  const jpeg = await compressImageToFile(file("x.png", "image/png"));
  assert.equal(jpeg.name, "x.jpg");
  assert.equal(jpeg.type, "image/jpeg");
});

test("older Safari: createImageBitmap rejects the options bag, retried without it", async () => {
  installDom({ bitmap: "no-options", width: 3000, height: 4000 });
  await compressImageToDataUrl(file("a.png", "image/png"));
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 900, h: 1200 });
});

test("no createImageBitmap: falls back to <img> + object URL and revokes it", async () => {
  installDom({ bitmap: "missing", width: 1000, height: 500 });
  await compressImageToDataUrl(file("b.webp", "image/webp"));
  assert.equal(calls.imgSrc, "blob:fake");
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1000, h: 500 });
  assert.equal(calls.revoked, 1);
});

test("object URL fails too: falls back to FileReader data URL", async () => {
  installDom({ bitmap: "fail", img: "fail", width: 2400, height: 2400 });
  await compressImageToDataUrl(file("c.jpg", "image/jpeg", 100_000));
  assert.match(calls.imgSrc, /^data:/);
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1200, h: 1200 });
});

test("HEIC the browser can't decode gives a friendly HEIC message", async () => {
  installDom({ bitmap: "fail", img: "fail", reader: "fail" });
  await assert.rejects(() => compressImageToDataUrl(file("IMG_9.HEIC", "")), /HEIC photo this browser can't open/);
});

test("HEIC message gives Android and iPhone their own fix", () => {
  const android = utils.unreadableImageMessage("a.heic", true, "Mozilla/5.0 (Linux; Android 14; SM-A546B) Chrome/156");
  assert.match(android, /Android/);
  assert.match(android, /High efficiency pictures/);
  assert.doesNotMatch(android, /iPhone|Safari/);
  assert.match(utils.unreadableImageMessage("a.heic", true, "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)"), /Most Compatible/);
  assert.match(utils.unreadableImageMessage("a.jpg", false), /couldn't open "a.jpg"/);
});

test("file input accept list is MIME-only (keeps Android's photo picker and camera)", () => {
  for (const part of utils.PHOTO_ACCEPT.split(",")) assert.match(part.trim(), /^image\//);
});

test("HEIC with empty MIME type is accepted and decoded when the browser can (iOS Safari)", async () => {
  installDom();
  const url = await compressImageToDataUrl(file("IMG_10.heic", ""));
  assert.match(url, /^data:image\/jpeg/);
});

test("non-images and huge files are refused with clear messages", async () => {
  installDom();
  await assert.rejects(() => compressImageToDataUrl(file("cv.pdf", "application/pdf")), /isn't a photo/);
  await assert.rejects(() => compressImageToDataUrl(file("big.jpg", "image/jpeg", 60 * 1024 * 1024)), /too large/);
});
