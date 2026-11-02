"use client";

import Link from "next/link";
import { LoaderCircle, SearchX } from "lucide-react";

import { ProductDetailView } from "@/components/product-detail-view";
import { useAsync } from "@/hooks/use-async";
import { getProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ProductPageClient({ slug, initialProduct }: { slug: string; initialProduct: Product | null }) {
  const { data, loading } = useAsync(() => getProduct(slug), [slug], initialProduct ?? undefined);
  const product = data ?? (loading ? initialProduct : null);

  if (product) return <ProductDetailView key={product.id} product={product} />;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[color:var(--brand-charcoal)]/60">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <SearchX className="mx-auto h-10 w-10 text-[color:var(--brand-primary)]" />
      <h1 className="font-display mt-4 text-3xl text-[color:var(--brand-deep)]">This piece isn&apos;t available</h1>
      <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">
        It may have sold out, or the listing is still waiting for approval.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-flex rounded-full bg-[color:var(--brand-primary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]"
      >
        Browse the shop
      </Link>
    </div>
  );
}
