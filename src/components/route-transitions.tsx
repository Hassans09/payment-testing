"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Track the previous pathname to detect real pathname changes (skip initial load).
  const prevPathnameRef = useRef<string | null>(null);
  // Stable container to which we apply/remove animation classes.
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced-motion: record current pathname to avoid initial animation, and skip animating.
    const prefersReduced =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      prevPathnameRef.current = pathname;
      // Also ensure no animation classes are present.
      const el = containerRef.current;
      if (el) {
        el.classList.remove("motion-fade-up", "fast");
      }
      return;
    }

    // If prevPathnameRef.current is null, this is the initial client mount: set and skip animation.
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    // If pathname didn't change, nothing to do.
    if (prevPathnameRef.current === pathname) {
      return;
    }

    // Real pathname change detected: update prevPathname and restart the animation.
    prevPathnameRef.current = pathname;

    const el = containerRef.current;
    if (!el) return;

    // Remove classes, force reflow, then re-add to restart the CSS animation.
    el.classList.remove("motion-fade-up", "fast");
    // Force reflow to reset animation state.
    void el.offsetWidth;
    el.classList.add("motion-fade-up", "fast");
  }, [pathname]);

  return (
    <div>
      <div
        ref={containerRef}
        onAnimationEnd={(e) => {
          // Only clear classes when the animation end event originates from the wrapper itself,
          // not from nested child animations.
          if (e.target !== e.currentTarget) return;
          const el = containerRef.current;
          if (!el) return;
          el.classList.remove("motion-fade-up", "fast");
        }}
      >
        {children}
      </div>
    </div>
  );
}
