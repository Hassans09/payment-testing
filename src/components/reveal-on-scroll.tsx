"use client";

import React, { useEffect, useRef } from "react";

type RevealOnScrollProps = {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
};

export default function RevealOnScroll({
  children,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.08,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    // Respect reduced-motion preference: do NOT add the animation class.
    // Leave content visible without animation.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      return;
    }

    // If IntersectionObserver isn't supported, do not add the class and leave content visible.
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("motion-fade-up");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
