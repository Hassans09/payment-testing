import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shop all products",
  description: `Shop clothing, shoes, bags and accessories from ${SITE_NAME} and approved independent sellers.`,
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
