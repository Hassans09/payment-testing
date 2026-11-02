import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or per-visitor pages. "/seller/" (dashboard, login) does not match the public "/sellers/…" storefronts.
        disallow: ["/admin", "/seller/", "/account", "/cart", "/checkout", "/wishlist", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
