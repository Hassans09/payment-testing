import { ProductGridSkeleton } from "@/components/product-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8" aria-busy="true">
      <div className="mb-6 h-9 w-48 animate-pulse rounded-full bg-[color:var(--brand-ivory)]" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
