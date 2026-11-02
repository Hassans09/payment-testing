"use client";

/**
 * Last-resort error screen when the root layout itself fails. It replaces the whole document,
 * so it can't rely on globals.css: the Rebel colours are inlined.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fffdfb", color: "#303030", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c49a78" }}>Rebel Fashion</p>
          <h1 style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontSize: 34, fontWeight: 400, margin: "12px 0" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, opacity: 0.75 }}>Please reload the page. Your bag is saved on this device.</p>
          {error.digest && <p style={{ fontSize: 12, opacity: 0.5 }}>Error code: {error.digest}</p>}
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 48, padding: "0 28px", borderRadius: 999, border: 0, background: "#c49a78", color: "#3d2b22", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the app shell is down, use a full reload */}
            <a href="/" style={{ minHeight: 48, display: "inline-flex", alignItems: "center", padding: "0 28px", borderRadius: 999, border: "1px solid #3d2b2240", color: "#3d2b22", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
