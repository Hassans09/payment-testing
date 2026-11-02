/** Shown while a product page streams in (seller listings load from the API). */
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8" aria-busy="true" aria-label="Loading product">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-[color:var(--brand-ivory)]" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[color:var(--brand-ivory)]" />
          <div className="h-9 w-3/4 animate-pulse rounded-full bg-[color:var(--brand-ivory)]" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-[color:var(--brand-ivory)]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[color:var(--brand-ivory)]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[color:var(--brand-ivory)]" />
        </div>
      </div>
    </div>
  );
}
