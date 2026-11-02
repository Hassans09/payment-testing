"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for the whole site, mounted once in the root layout.
 *
 * Mark elements in markup, no wrapper components needed:
 *   <section data-reveal>…</section>          one block floats up + fades in
 *   <div data-reveal-stagger>…cards…</div>    each child does, staggered slightly
 *
 * - IntersectionObserver, animates once, transform/opacity only.
 * - Progressive enhancement: nothing is hidden until this script adds `rf-reveal-ready` to
 *   <html>. If JS fails, IntersectionObserver is missing, or the user prefers reduced motion,
 *   everything simply stays visible.
 * - Elements already on screen when they are first observed (top of a fresh page) are shown
 *   instantly: the page transition already animates them, so they don't animate twice.
 * - New nodes (client-rendered grids, route changes) are picked up by a MutationObserver.
 */
const ITEM_SELECTOR = "[data-reveal], [data-reveal-stagger] > *";
const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 6;

export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (typeof IntersectionObserver === "undefined" || reduceMotion?.matches) return;

    const seen = new WeakSet<Element>();
    const firstCheck = new WeakSet<Element>();

    const reveal = (element: HTMLElement, animate: boolean, delay = 0) => {
      if (animate) {
        element.style.setProperty("--reveal-delay", `${delay}ms`);
        element.setAttribute("data-reveal-anim", "");
        const done = (event: AnimationEvent) => {
          if (event.target !== element) return; // ignore animations bubbling up from children
          element.removeEventListener("animationend", done);
          element.removeAttribute("data-reveal-anim");
          element.style.removeProperty("--reveal-delay");
        };
        element.addEventListener("animationend", done);
      }
      // A data attribute (not a class) so React re-renders of className never undo it.
      element.setAttribute("data-revealed", "");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const isFirst = !firstCheck.has(element);
          firstCheck.add(element);
          if (!entry.isIntersecting) continue;
          observer.unobserve(element);
          if (isFirst && entry.boundingClientRect.top < window.innerHeight * 0.92) {
            // Already visible when it appeared: show without animating.
            reveal(element, false);
            continue;
          }
          const staggered = element.parentElement?.hasAttribute("data-reveal-stagger");
          reveal(element, true, staggered ? Math.min(step, MAX_STAGGER_STEPS) * STAGGER_MS : 0);
          if (staggered) step += 1;
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((element) => {
        if (seen.has(element) || element.hasAttribute("data-revealed")) return;
        seen.add(element);
        observer.observe(element);
      });
    };

    root.classList.add("rf-reveal-ready");
    scan();

    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    // If the user switches on reduced motion mid-session, show everything.
    const onMotionChange = () => {
      if (reduceMotion?.matches) {
        root.classList.remove("rf-reveal-ready");
        observer.disconnect();
      }
    };
    reduceMotion?.addEventListener?.("change", onMotionChange);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      reduceMotion?.removeEventListener?.("change", onMotionChange);
      root.classList.remove("rf-reveal-ready");
    };
  }, []);

  return null;
}
