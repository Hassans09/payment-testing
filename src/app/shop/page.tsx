"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Catalogue, parseGender, parseSoldBy } from "@/components/catalogue";
import { ProductGridSkeleton } from "@/components/product-card";
import { parseSort } from "@/lib/product-sort";
import { isCategorySlug } from "@/lib/config";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <ShopParamsWrapper />
    </Suspense>
  );
}

/** /shop?search=&gender=&sold=platform|marketplace&sort=discover|newest|price-asc|price-desc|name&category= (category also has its own page: /category/[slug]). */
function ShopParamsWrapper() {
  const params = useSearchParams();
  const search = params.get("search") ?? "";
  const gender = parseGender(params.get("gender"));
  const soldBy = parseSoldBy(params.get("sold"));
  const sort = parseSort(params.get("sort"));
  const categoryParam = params.get("category");
  const category = isCategorySlug(categoryParam) ? categoryParam : undefined;
  return (
    <Catalogue
      key={`${search}:${gender}:${soldBy}:${sort}:${category ?? ""}`}
      category={category}
      initialSearch={search}
      initialGender={gender}
      initialSoldBy={soldBy}
      initialSort={sort}
    />
  );
}
