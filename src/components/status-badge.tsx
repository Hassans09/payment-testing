import type { FulfilmentStatus, ListingStatus, OrderStatus, SellerStatus } from "@/lib/types";

type AnyStatus = ListingStatus | OrderStatus | SellerStatus | FulfilmentStatus | "open" | "resolved";

const styles: Record<AnyStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  paid: "bg-sky-50 text-sky-800 ring-sky-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  paused: "bg-stone-100 text-stone-700 ring-stone-200",
  processing: "bg-amber-50 text-amber-800 ring-amber-200",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  open: "bg-amber-50 text-amber-800 ring-amber-200",
  resolved: "bg-stone-100 text-stone-600 ring-stone-200",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
