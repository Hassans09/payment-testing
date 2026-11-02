"use client";

import { useEffect, useSyncExternalStore } from "react";

import { readString, writeString } from "@/lib/client-storage";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

/**
 * Intro splash (inspired by kaystores.vercel.app): the brand name builds up in
 * the middle of a dark screen, then two panels part to reveal the homepage.
 * Shown once per browser session on the homepage, skippable.
 *
 * An inline script in layout.tsx sets html[data-splash-boot="1"] before first
 * paint so the homepage never flashes before the splash appears.
 */

import { SPLASH_SESSION_KEY } from "@/lib/splash";

type Phase = "hidden" | "show" | "exit";

let phase: Phase | null = null;
const listeners = new Set<() => void>();

function getPhase(): Phase {
  if (phase === null) {
    const booted = typeof document !== "undefined" && document.documentElement.dataset.splashBoot === "1";
    phase = booted && readString(SPLASH_SESSION_KEY, "session") !== "1" ? "show" : "hidden";
  }
  return phase;
}

function setPhase(next: Phase) {
  phase = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function endSplash() {
  writeString(SPLASH_SESSION_KEY, "1", "session");
  document.documentElement.removeAttribute("data-splash-boot");
  document.body.style.overflow = "";
}

export function SplashIntro() {
  const current = useSyncExternalStore(subscribe, getPhase, () => "hidden" as Phase);

  useEffect(() => {
    if (current !== "show") return;
    document.body.style.overflow = "hidden";
    // The splash itself now covers the page, so drop the pre-paint cover.
    document.documentElement.setAttribute("data-splash-boot", "mounted");

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPhase("exit"), reduced ? 900 : 3600);
    return () => window.clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (current !== "exit") return;
    const timer = window.setTimeout(() => {
      endSplash();
      setPhase("hidden");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (current === "hidden") return null;

  const letters = Array.from(SITE_NAME);

  return (
    <div className={`rf-splash ${current === "exit" ? "rf-splash--exit" : ""}`} role="dialog" aria-label={`${SITE_NAME} intro`}>
      <div className="rf-splash-panel rf-splash-panel--left" />
      <div className="rf-splash-panel rf-splash-panel--right" />
      <div className="rf-splash-ambient" aria-hidden="true" />
      <div className="rf-splash-grain" aria-hidden="true" />

      <div className="rf-splash-center">
        <p className="rf-splash-eyebrow">Est. 2026 · Nigeria</p>
        <h1 className="rf-splash-word" aria-label={SITE_NAME}>
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="rf-splash-letter"
              style={{ ["--i" as string]: index }}
              aria-hidden="true"
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </h1>
        <div className="rf-splash-meta">
          <span className="rf-splash-rule" />
          <p className="rf-splash-tag">{SITE_TAGLINE}</p>
          <span className="rf-splash-rule" />
        </div>
      </div>

      <p className="rf-splash-footer">Clothing · Shoes · Bags · Accessories</p>

      <button
        type="button"
        className="rf-splash-skip"
        onClick={() => {
          endSplash();
          setPhase("hidden");
        }}
      >
        Skip intro
      </button>
    </div>
  );
}
