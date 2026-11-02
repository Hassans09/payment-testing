"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LoaderCircle, LogOut, PackageOpen, Plus, Store } from "lucide-react";

import { DeleteAccountPanel, FulfilmentControl, ListingRow, StoreProfileForm, StoreStatusBanner } from "@/components/seller-dashboard-parts";

import { StatusBadge } from "@/components/status-badge";
import { Card, StatCard, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { useAsync } from "@/hooks/use-async";
import { useSellerSession } from "@/hooks/use-session";
import { getSellerListings, getSellerOrders, logoutSeller } from "@/lib/api";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/config";
import { formatDate, formatLineOptions, formatPrice, maskAccountNumber } from "@/lib/format";

type Tab = "listings" | "orders" | "profile";

const PAYOUT_TEXT = { not_set_up: "Payouts set up after your first approval", pending: "Payout account being verified", active: "Payouts active", on_hold: "Payouts on hold: contact us" } as const;

export default function SellerDashboardPage() {
  const router = useRouter();
  const { seller, loading, reload: reloadSeller } = useSellerSession();
  const [tab, setTab] = useState<Tab>("listings");

  const listings = useAsync(() => (seller ? getSellerListings() : Promise.resolve([])), [seller?.id]);
  const orders = useAsync(() => (seller ? getSellerOrders() : Promise.resolve([])), [seller?.id]);

  const stats = useMemo(() => {
    const items = listings.data ?? [];
    // Earnings count paid orders only (the 90/10 split is applied per line by the server).
    const sales = (orders.data ?? []).filter((order) => order.paid && order.status !== "cancelled");
    return {
      live: items.filter((item) => item.status === "approved").length,
      pending: items.filter((item) => item.status === "pending").length,
      rejected: items.filter((item) => item.status === "rejected").length,
      gross: sales.reduce((sum, order) => sum + order.grossAmount, 0),
      commission: sales.reduce((sum, order) => sum + order.commissionAmount, 0),
      net: sales.reduce((sum, order) => sum + order.sellerAmount, 0),
    };
  }, [listings.data, orders.data]);

  if (loading || !seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-[color:var(--brand-border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow flex items-center gap-2"><Store className="h-3.5 w-3.5" /> Seller centre</span>
          <h1 className="font-display mt-2 break-words text-4xl text-[color:var(--brand-deep)] sm:text-5xl">{seller.businessName}</h1>
          <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/70">
            {seller.ownerName} · Payouts to {seller.bank.bankName} {maskAccountNumber(seller.bank.accountNumber)}
            {" · "}{PAYOUT_TEXT[seller.payout?.status ?? "not_set_up"]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/seller/listings/new" className={primaryButtonClass}>
            <Plus className="h-4 w-4" /> New listing
          </Link>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={async () => {
              await logoutSeller();
              router.push("/seller/login");
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      <StoreStatusBanner seller={seller} />

      <div className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-5">
        <StatCard label="Live listings" value={String(stats.live)} hint={`${stats.pending} pending · ${stats.rejected} rejected`} />
        <StatCard label="Orders" value={String(orders.data?.length ?? 0)} />
        <StatCard label="Gross sales" value={formatPrice(stats.gross)} />
        <StatCard label={`Commission (${PLATFORM_COMMISSION_PERCENT}%)`} value={formatPrice(stats.commission)} />
        <div className="col-span-2 lg:col-span-1"><StatCard label={`Your earnings (${100 - PLATFORM_COMMISSION_PERCENT}%)`} value={formatPrice(stats.net)} hint={`Paid orders only · ${PAYOUT_TEXT[seller.payout?.status ?? "not_set_up"]}`} /></div>
      </div>

      <div className="mt-8 flex w-full gap-1 overflow-x-auto rounded-full border border-[color:var(--brand-border)] bg-white p-1 scrollbar-none sm:w-fit">
        {(["listings", "orders", "profile"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-bold uppercase tracking-wider transition sm:px-5 ${
              tab === value ? "bg-[color:var(--brand-deep)] text-white" : "text-[color:var(--brand-charcoal)]/75 hover:bg-[color:var(--brand-soft)]/50"
            }`}
          >
            {value === "listings" ? `My listings (${listings.data?.length ?? 0})` : value === "orders" ? `Orders (${orders.data?.length ?? 0})` : "Store profile"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "profile" ? (
          <>
            <StoreProfileForm seller={seller} onSaved={() => { reloadSeller(); listings.reload(); }} />
            <DeleteAccountPanel onDeleted={() => { window.location.assign("/?account=deleted"); }} />
          </>
        ) : tab === "listings" ? (
          listings.loading && !listings.data ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--brand-primary)]" />
          ) : (listings.data ?? []).length === 0 ? (
            <Card className="text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-[color:var(--brand-primary)]" />
              <h2 className="font-display mt-3 text-2xl text-[color:var(--brand-deep)]">Add your first product</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--brand-charcoal)]/70">
                Upload photos, set your colours, sizes and price. Our team reviews each listing, usually within 24 hours.
              </p>
              <Link href="/seller/listings/new" className={`${primaryButtonClass} mt-6`}>
                <Plus className="h-4 w-4" /> New listing
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {(listings.data ?? []).map((item) => (
                <ListingRow key={item.id} item={item} onChanged={listings.reload} />
              ))}
            </div>
          )
        ) : orders.loading && !orders.data ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--brand-primary)]" />
        ) : (orders.data ?? []).length === 0 ? (
          <Card className="text-center text-sm text-[color:var(--brand-charcoal)]/70">No orders yet. They&apos;ll appear here as soon as a customer buys one of your pieces.</Card>
        ) : (
          <div className="space-y-4">
            {(orders.data ?? []).map((order) => (
              <Card key={order.orderId}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[color:var(--brand-deep)]">{order.reference}</p>
                    <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                      {formatDate(order.createdAt)} · {order.customerName} · {order.city}, {order.state}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <ul className="mt-4 divide-y divide-[color:var(--brand-border)] text-sm">
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.type ?? ""}-${item.color}-${item.size}`} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">
                        {item.quantity} × {item.name} <span className="text-xs text-[color:var(--brand-charcoal)]/60">({formatLineOptions(item)})</span>
                      </span>
                      <span className="shrink-0 font-semibold">{formatPrice(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-[color:var(--brand-cream)] p-3 text-xs">
                  <div><dt className="text-[color:var(--brand-charcoal)]/60">Gross</dt><dd className="font-bold">{formatPrice(order.grossAmount)}</dd></div>
                  <div><dt className="text-[color:var(--brand-charcoal)]/60">Commission</dt><dd className="font-bold">− {formatPrice(order.commissionAmount)}</dd></div>
                  <div><dt className="text-[color:var(--brand-charcoal)]/60">You earn</dt><dd className="font-bold text-emerald-700">{formatPrice(order.sellerAmount)}</dd></div>
                </dl>
                <div className="mt-3">
                  <FulfilmentControl order={order} onChanged={orders.reload} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
