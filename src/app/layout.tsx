import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";

import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SplashIntro } from "@/components/splash-intro";
import { SPLASH_SESSION_KEY } from "@/lib/splash";
import { StoreProvider } from "@/components/store-provider";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/config";
import { WhatsAppButton } from "@/components/whatsapp-button";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf9f4",
};

const siteDescription = `Shop clothing, shoes, bags and accessories at ${SITE_NAME}: our own collection plus approved independent fashion sellers across Nigeria.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: siteDescription,
    images: [{ url: "/products/camel-linen-kaftan-set.webp", alt: `${SITE_NAME} kaftans` }],
  },
  twitter: { card: "summary_large_image" },
};

// Runs before first paint: on the homepage, covers the page until the intro
// splash mounts (once per session) so the homepage never flashes first.
const splashBootScript = `(function(){try{if(location.pathname==="/"&&sessionStorage.getItem(${JSON.stringify(
  SPLASH_SESSION_KEY
)})!=="1"){document.documentElement.setAttribute("data-splash-boot","1");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body className="bg-[color:var(--brand-background)] text-[color:var(--brand-charcoal)]">
        <StoreProvider>
          <SplashIntro />
          <Header />
          <CartDrawer />
          <main id="main-content">{children}</main>
          <ScrollReveal />
          <Footer />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
