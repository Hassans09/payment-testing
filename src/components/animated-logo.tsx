"use client";

import { useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.addEventListener) {
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  } else {
    mq.addListener(callback);
    return () => mq.removeListener(callback);
  }
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function AnimatedLogo({ className = "" }: { className?: string }) {
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // The design: "REBEL" in a modern, confident sans with tight tracking, and
  // "Fashion" in an elegant serif italic to create a premium contrast—both
  // rendered as SVG text so we can control proportions and spacing precisely.
  return (
    <div className={`rebel-wordmark ${className}`} aria-hidden={false}>
      <span className="sr-only">Rebel Fashion</span>

      <svg
        viewBox="0 0 420 64"
        className="h-8 sm:h-10 md:h-12 w-auto"
        role="img"
        aria-label="Rebel Fashion"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-grad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="var(--brand-chocolate)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--brand-deep)" stopOpacity="1" />
          </linearGradient>
          <style>
            {`
              .rm-rebel { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-weight:700; font-size:36px; letter-spacing: 0.08em; }
              .rm-fashion { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight:500; font-size:22px; letter-spacing: 0.06em; }
            `}
          </style>
        </defs>

        {/* REBEL (uppercase, confident) */}
        <text x="0" y="42" className="rm-rebel" fill="url(#brand-grad)">REBEL</text>

        {/* Fashion (serif italic, offset to feel like a wordmark) */}
        <text x="192" y="54" className="rm-fashion" fill="var(--brand-chocolate)">Fashion</text>

        {/* subtle underline flourish (soft caramel stroke) */}
        <path
          d="M6 56 C60 70 140 66 190 52 C240 38 320 46 414 56"
          fill="none"
          stroke="var(--brand-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.9"
          style={{ opacity: prefersReduced ? 1 : 0.95 }}
        />
      </svg>

      <style>{`
        .rebel-wordmark { color: var(--brand-deep); display: inline-flex; align-items: center; }
        /* Ensure SVG text inherits color where used */
        .rebel-wordmark svg { display: block; }
        @media (prefers-reduced-motion: reduce) {
          .rebel-wordmark .lightning, .rebel-wordmark .anim { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
