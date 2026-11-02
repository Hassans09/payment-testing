"use client";

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
  const href = whatsappLink(`Hello ${SITE_NAME}, I have a question.`);
  if (!href || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[0_12px_30px_rgba(31,122,77,0.35)] transition hover:scale-105 hover:bg-[#186540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a4d] sm:right-6"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
