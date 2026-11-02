"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { SITE_NAME, whatsappLink } from "@/lib/config";

/** Pages where a floating chat bubble would get in the way (payment, dashboards). */
const HIDDEN_PREFIXES = ["/checkout", "/admin", "/seller/"];

/**
 * Floating "Chat on WhatsApp" button. Renders nothing unless NEXT_PUBLIC_WHATSAPP_NUMBER is set
 * (the value is inlined at build time, so the button appears after the next deploy).
 */
export function WhatsAppButton() {
  const pathname = usePathname() ?? "/";
  // The bubble waits until the visitor scrolls a little, so it never sits on top of the first
  // screen (hero + first row of products and their add buttons).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    // Short pages that can barely scroll show it straight away.
    const onScroll = () =>
      setScrolled(window.scrollY > 320 || document.documentElement.scrollHeight - window.innerHeight < 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const href = whatsappLink(`Hello ${SITE_NAME}, I have a question.`);
  if (!href || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      aria-hidden={scrolled ? undefined : true}
      tabIndex={scrolled ? undefined : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-30 inline-flex h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[0_12px_30px_rgba(31,122,77,0.35)] transition hover:scale-105 hover:bg-[#186540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a4d] sm:right-6 ${scrolled ? "" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
    </a>
  );
}
