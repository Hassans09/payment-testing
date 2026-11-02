import type { Metadata } from "next";

import { SellerStorefront } from "@/components/seller-storefront";
import { PLATFORM_SELLER_ID, SITE_NAME } from "@/lib/config";
import { absoluteImage, getServerSellerProfile, metaDescription } from "@/lib/server-catalog";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  // Marketplace stores only reach the server in "http" mode; the demo store keeps them in the browser.
  const profile = await getServerSellerProfile(id);
  const name = id === PLATFORM_SELLER_ID ? `${SITE_NAME} store` : profile?.businessName ?? "Seller store";
  const description = metaDescription(
    id === PLATFORM_SELLER_ID
      ? `Shop ${SITE_NAME}'s own collection.`
      : profile?.bio || `Shop ${profile?.businessName ?? "an independent seller"} on ${SITE_NAME}.`
  );
  const logo = absoluteImage(profile?.logo);
  return {
    title: name,
    description,
    alternates: { canonical: `/sellers/${encodeURIComponent(id)}` },
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description,
      url: `/sellers/${encodeURIComponent(id)}`,
      ...(logo ? { images: [{ url: logo, alt: name }] } : {}),
    },
  };
}

export default async function SellerPage({ params }: Params) {
  const { id } = await params;
  return <SellerStorefront sellerId={id} />;
}
