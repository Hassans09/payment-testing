"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Catalogue, parseGender, parseSoldBy } from "@/components/catalogue";
import { ProductGridSkeleton } from "@/components/product-card";
import type { CategorySlug } from "@/lib/config";

export function CategoryView({ slug }: { slug: CategorySlug }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <CategoryWithParams slug={slug} />
    </Suspense>
  );
}

function CategoryWithParams({ slug }: { slug: CategorySlug }) {
  const params = useSearchParams();
  const gender = parseGender(params.get("gender"));
  const soldBy = parseSoldBy(params.get("sold"));
  const search = params.get("search") ?? "";
  return <Catalogue key={`${slug}:${gender}:${soldBy}:${search}`} category={slug} initialGender={gender} initialSoldBy={soldBy} initialSearch={search} />;
}
