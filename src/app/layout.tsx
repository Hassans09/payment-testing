import type { Metadata } from "next";

import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import RouteTransitions from "@/components/route-transitions";

import "./globals.css";

export const metadata: Metadata = {
  title: "Curated Storefront | Fashion & Gifting",
  description: "A polished storefront experience for curated fashion and gifting collections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[color:var(--brand-background)] text-[color:var(--brand-charcoal)]">
        <StoreProvider>
          <Header />
          <CartDrawer />
          <main>
            <RouteTransitions>{children}</RouteTransitions>
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
