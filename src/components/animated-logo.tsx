"use client";

import { useSyncExternalStore } from "react";

import { SITE_NAME } from "@/lib/config";

const [firstWord, ...restWords] = SITE_NAME.split(" ");
const secondWord = restWords.join(" ");
// Rough width of the first word in the SVG so the script word sits after it.
const secondX = Math.round(firstWord.length * 30 + 48);

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

  return (
    <div className={`store-wordmark ${className}`} aria-hidden={false}>
      <span className="sr-only">{SITE_NAME}</span>

      <svg
        viewBox="0 0 420 64"
        className="h-8 sm:h-10 md:h-12 w-auto"
        role="img"
        aria-label={SITE_NAME}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brand-grad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="var(--brand-chocolate)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--brand-deep)" stopOpacity="1" />
          </linearGradient>
          <style>
            {`
              .rm-store { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-weight:700; font-size:34px; letter-spacing: 0.09em; }
              .rm-front { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight:500; font-size:22px; letter-spacing: 0.06em; }
            `}
          </style>
        </defs>

        <text x="0" y="42" className="rm-store" fill="url(#brand-grad)">{firstWord.toUpperCase()}</text>
        <text x={secondX} y="54" className="rm-front" fill="var(--brand-chocolate)">{secondWord}</text>
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
        .store-wordmark { color: var(--brand-deep); display: inline-flex; align-items: center; }
        .store-wordmark svg { display: block; }
        @media (prefers-reduced-motion: reduce) {
          .store-wordmark .lightning, .store-wordmark .anim { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
