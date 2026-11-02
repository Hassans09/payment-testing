"use client";

import { usePathname } from "next/navigation";

/**
 * Animates every new page in: fade + float up ~20px over 450ms (ease-out), CSS keyframes only,
 * transform/opacity only (GPU-friendly on low-end Android). Disabled by prefers-reduced-motion
 * in globals.css.
 *
 * The very first page load is NOT animated (it would delay the first paint, and the homepage has
 * its own intro); every later client-side navigation is. Keying on the pathname re-mounts the
 * wrapper even for navigations inside one segment (e.g. product -> product), which the root
 * template alone would not re-mount. Search-param-only changes (filters) don't animate.
 *
 * Progressive enhancement: the content is visible by default; the animation only starts from
 * opacity 0 when CSS animations run, and uses `backwards` fill so nothing stays transformed
 * afterwards (a leftover transform would trap position:fixed children).
 */
let hasMountedOnce = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Read during render on purpose: false for the server render and hydration (no class, no
  // mismatch), true for every page rendered after a client-side navigation.
  const animate = hasMountedOnce;

  return (
    <div key={pathname} ref={markMounted} className={animate ? "rf-page-enter" : undefined}>
      {children}
    </div>
  );
}

function markMounted(node: HTMLDivElement | null) {
  if (node) hasMountedOnce = true;
}
