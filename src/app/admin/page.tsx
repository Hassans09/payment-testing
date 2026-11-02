"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, LoaderCircle, LogOut, ShieldCheck, X } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { Card, StatCard, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { useAsync } from "@/hooks/use-async";
import { useAdminSession } from "@/hooks/use-session";
import {
  approveListing,
  getAdminOverview,
  getAllProducts,
  getOrders,
  getPendingListings,
  getSellers,
  logoutAdmin,
  rejectListing,
  updateOrderStatus,
} from "@/lib/api";
import { PLATFORM_COMMISSION_PERCENT, PLATFORM_SELLER_ID, SITE_NAME, categoryName } from "@/lib/config";
import { formatDate, formatLineOptions, formatPrice, maskAccountNumber } from "@/lib/format";
import type { Order, OrderStatus, PayoutStatus, Product } from "@/lib/types";

type Tab = "overview" | "pending" | "products" | "sellers" | "orders";
const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

const PAYOUT_LABELS: Record<PayoutStatus, string> = {
  not_set_up: "Not set up (on first approval)",
  pending: "Verifying bank account",
  active: "Active",
  on_hold: "On hold",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, loading } = useAdminSession();
  const [tab, setTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const enabled = Boolean(admin);

  const overview = useAsync(() => (enabled ? getAdminOverview() : Promise.resolve(null)), [enabled, refreshKey]);
  const pending = useAsync(() => (enabled ? getPendingListings() : Promise.resolve([])), [enabled, refreshKey]);
  const products = useAsync(() => (enabled ? getAllProducts() : Promise.resolve([])), [enabled, refreshKey]);
  const sellers = useAsync(() => (enabled ? getSellers() : Promise.resolve([])), [enabled, refreshKey]);
  const orders = useAsync(() => (enabled ? getOrders() : Promise.resolve([])), [enabled, refreshKey]);

  const refresh = () => setRefreshKey((value) => value + 1);

  if (loading || !admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--brand-primary)]" />
      </div>
    );
  }

  const tabs: { value: Tab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "pending", label: `Pending (${pending.data?.length ?? 0})` },
    { value: "products", label: `All products (${products.data?.length ?? 0})` },
    { value: "sellers", label: `Sellers (${sellers.data?.length ?? 0})` },
    { value: "orders", label: `Orders (${orders.data?.length ?? 0})` },
  ];

  const o = overview.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[color:var(--brand-border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Admin</span>
          <h1 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">{SITE_NAME} control room</h1>
          <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/70">Signed in as {admin.email}</p>
        </div>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={async () => {
            await logoutAdmin();
            router.push("/admin/login");
          }}
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-[color:var(--brand-border)] bg-white p-1 scrollbar-none sm:w-fit">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold uppercase tracking-wider transition ${
              tab === item.value ? "bg-[color:var(--brand-deep)] text-white" : "text-[color:var(--brand-charcoal)]/75 hover:bg-[color:var(--brand-soft)]/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          !o ? <Spinner /> : (
            <div className="space-y-6">
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-4">
                <StatCard label="GMV" value={formatPrice(o.gmv)} hint="Order subtotals, excl. cancelled" />
                <StatCard label={`Commission earned (${PLATFORM_COMMISSION_PERCENT}%)`} value={formatPrice(o.commissionEarned)} hint="From marketplace sellers" />
                <StatCard label="Own-store revenue" value={formatPrice(o.ownStoreRevenue)} hint={`Sold by ${SITE_NAME}`} />
                <StatCard label="Owed to sellers" value={formatPrice(o.sellerPayouts)} hint={`Sellers' ${100 - PLATFORM_COMMISSION_PERCENT}% share, paid out by the platform`} />
                <StatCard label="Orders" value={String(o.orderCount)} hint={`${o.ordersByStatus.paid} paid · ${o.ordersByStatus.shipped} shipped`} />
                <StatCard label="Live products" value={String(o.productCounts.approved)} hint={`${o.productCounts.total} total`} />
                <StatCard label="Pending review" value={String(o.productCounts.pending)} hint={`${o.productCounts.rejected} rejected`} />
                <StatCard label="Sellers" value={String(o.sellerCount)} />
              </div>
              {o.productCounts.pending > 0 && (
                <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[color:var(--brand-deep)]"><strong>{o.productCounts.pending}</strong> listing{o.productCounts.pending === 1 ? "" : "s"} waiting for review.</p>
                  <button type="button" className={primaryButtonClass} onClick={() => setTab("pending")}>Review now</button>
                </Card>
              )}
            </div>
          )
        )}

        {tab === "pending" && (
          pending.loading && !pending.data ? <Spinner /> : (pending.data ?? []).length === 0 ? (
            <Card className="text-center text-sm text-[color:var(--brand-charcoal)]/70">All caught up — no listings waiting for review.</Card>
          ) : (
            <div className="space-y-5">
              {(pending.data ?? []).map((product) => (
                <PendingListing key={product.id} product={product} onDone={refresh} />
              ))}
            </div>
          )
        )}

        {tab === "products" && (
          products.loading && !products.data ? <Spinner /> : (
            <>
              {/* Phones: one card per product */}
              <ul className="space-y-3 md:hidden">
                {(products.data ?? []).map((product) => (
                  <li key={product.id} className="flex gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-3">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[color:var(--brand-ivory)]">
                      <SmartImage src={product.images[0]} alt="" fill sizes="64px" className="object-cover object-top" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        {product.status === "approved" ? (
                          <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-[color:var(--brand-deep)] hover:underline">{product.name}</Link>
                        ) : (
                          <span className="line-clamp-2 text-sm font-semibold text-[color:var(--brand-deep)]">{product.name}</span>
                        )}
                        <StatusBadge status={product.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-[color:var(--brand-charcoal)]/65">
                        {product.sellerId === PLATFORM_SELLER_ID ? `${SITE_NAME} (own)` : product.sellerName} · {categoryName(product.category)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[color:var(--brand-deep)]">
                        {formatPrice(product.price)} <span className="font-normal text-[color:var(--brand-charcoal)]/60">· {product.stock} in stock</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablet and up: table (scrolls sideways if needed) */}
              <div className="hidden overflow-x-auto rounded-2xl border border-[color:var(--brand-border)] bg-white md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[color:var(--brand-cream)] text-[10px] uppercase tracking-[0.18em] text-[color:var(--brand-charcoal)]/60">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--brand-border)]">
                    {(products.data ?? []).map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[color:var(--brand-ivory)]">
                              <SmartImage src={product.images[0]} alt="" fill sizes="40px" className="object-cover object-top" />
                            </div>
                            {product.status === "approved" ? (
                              <Link href={`/product/${product.slug}`} className="font-semibold text-[color:var(--brand-deep)] hover:underline">{product.name}</Link>
                            ) : (
                              <span className="font-semibold text-[color:var(--brand-deep)]">{product.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.sellerId === PLATFORM_SELLER_ID ? <span className="font-semibold text-[color:var(--brand-primary)]">{SITE_NAME} (own)</span> : product.sellerName}</td>
                        <td className="px-4 py-3">{categoryName(product.category)}{product.productType ? <span className="block text-xs text-[color:var(--brand-charcoal)]/55">{product.productType}</span> : null}</td>
                        <td className="px-4 py-3">{formatPrice(product.price)}</td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}

        {tab === "sellers" && (
          sellers.loading && !sellers.data ? <Spinner /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {(sellers.data ?? []).map((seller) => {
                const sellerProducts = (products.data ?? []).filter((p) => p.sellerId === seller.id);
                return (
                  <Card key={seller.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl text-[color:var(--brand-deep)]">{seller.businessName}</h3>
                        <p className="text-xs text-[color:var(--brand-charcoal)]/65">{seller.ownerName} · Joined {formatDate(seller.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">{seller.status}</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 text-xs">
                      <div><dt className="text-[color:var(--brand-charcoal)]/55">Email</dt><dd className="break-all font-semibold">{seller.email}</dd></div>
                      <div><dt className="text-[color:var(--brand-charcoal)]/55">Phone</dt><dd className="font-semibold">{seller.phone}</dd></div>
                      <div><dt className="text-[color:var(--brand-charcoal)]/55">Bank</dt><dd className="font-semibold">{seller.bank.bankName} {maskAccountNumber(seller.bank.accountNumber)}</dd></div>
                      <div><dt className="text-[color:var(--brand-charcoal)]/55">Account name</dt><dd className="font-semibold">{seller.bank.accountName}</dd></div>
                      <div><dt className="text-[color:var(--brand-charcoal)]/55">Payouts</dt><dd className="font-semibold">{PAYOUT_LABELS[seller.payout?.status ?? "not_set_up"]}{seller.payout?.reference ? ` · ${seller.payout.reference}` : ""}</dd></div>
                      <div>
                        <dt className="text-[color:var(--brand-charcoal)]/55">Listings</dt>
                        <dd className="font-semibold">
                          {sellerProducts.filter((p) => p.status === "approved").length} live · {sellerProducts.filter((p) => p.status === "pending").length} pending · {sellerProducts.filter((p) => p.status === "rejected").length} rejected
                        </dd>
                      </div>
                    </dl>
                  </Card>
                );
              })}
            </div>
          )
        )}

        {tab === "orders" && (
          orders.loading && !orders.data ? <Spinner /> : (orders.data ?? []).length === 0 ? (
            <Card className="text-center text-sm text-[color:var(--brand-charcoal)]/70">No orders yet.</Card>
          ) : (
            <div className="space-y-4">
              {(orders.data ?? []).map((order) => (
                <OrderCard key={order.id} order={order} onChanged={refresh} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--brand-primary)]" />;
}

function PendingListing({ product, onDone }: { product: Product; onDone: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const allImages = [...new Set([...product.images, ...product.colors.flatMap((c) => (c.image ? [c.image] : []))])];

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[color:var(--brand-ivory)]">
            <SmartImage src={activeImage} alt={product.name} fill sizes="260px" className="object-cover object-top" />
          </div>
          {allImages.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {allImages.map((src) => (
                <button key={src.slice(-40)} type="button" onClick={() => setActiveImage(src)} className={`relative h-16 w-12 min-w-11 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === src ? "border-[color:var(--brand-deep)]" : "border-transparent"}`}>
                  <SmartImage src={src} alt="" fill sizes="48px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            <span className="text-xs text-[color:var(--brand-charcoal)]/60">Submitted {formatDate(product.createdAt)}</span>
          </div>
          <h3 className="font-display mt-2 text-2xl text-[color:var(--brand-deep)] sm:text-3xl">{product.name}</h3>
          <p className="mt-1 text-sm">by <strong>{product.sellerName}</strong></p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80">{product.description}</p>
          <dl className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 text-xs sm:grid-cols-4">
            <div><dt className="text-[color:var(--brand-charcoal)]/55">Price</dt><dd className="font-bold">{formatPrice(product.price)}</dd></div>
            <div><dt className="text-[color:var(--brand-charcoal)]/55">Stock</dt><dd className="font-bold">{product.stock}</dd></div>
            <div><dt className="text-[color:var(--brand-charcoal)]/55">Category</dt><dd className="font-bold">{categoryName(product.category)}{product.productType ? ` · ${product.productType}` : ""}</dd></div>
            <div><dt className="text-[color:var(--brand-charcoal)]/55">Gender</dt><dd className="font-bold capitalize">{product.gender === "unisex" ? "Unisex / not set" : product.gender}</dd></div>
            {product.typeOption && product.typeOption.values.length > 0 && (
              <div className="col-span-2"><dt className="text-[color:var(--brand-charcoal)]/55">{product.typeOption.label} options</dt><dd className="font-bold">{product.typeOption.values.join(", ")}</dd></div>
            )}
            <div className="col-span-2"><dt className="text-[color:var(--brand-charcoal)]/55">Sizes</dt><dd className="font-bold">{product.sizes.join(", ")}</dd></div>
            <div className="col-span-2">
              <dt className="text-[color:var(--brand-charcoal)]/55">Colours</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color.name} className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--brand-border)] px-2 py-0.5 font-semibold">
                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                    {color.name}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

          {rejecting ? (
            <div className="mt-5 space-y-3">
              <label htmlFor={`reason-${product.id}`} className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Reason (shown to the seller)</label>
              <textarea id={`reason-${product.id}`} rows={3} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Photos are blurry — please upload a clear front view." />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy || !reason.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50" onClick={() => run(() => rejectListing(product.id, reason))}>
                  <X className="h-4 w-4" /> Confirm rejection
                </button>
                <button type="button" className={secondaryButtonClass} onClick={() => setRejecting(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-800 disabled:opacity-50" onClick={() => run(() => approveListing(product.id))}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
              </button>
              <button type="button" disabled={busy} className={secondaryButtonClass} onClick={() => setRejecting(true)}>
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function OrderCard({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function changeStatus(status: OrderStatus) {
    setSaving(true);
    try {
      await updateOrderStatus(order.id, status);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-11 min-w-0 items-start gap-2 text-left">
          <ChevronDown className={`mt-1 h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[color:var(--brand-deep)]">{order.reference}</span>
            <span className="block text-xs text-[color:var(--brand-charcoal)]/65">
              {formatDate(order.createdAt)} · {order.customer.fullName} · {order.customer.city}, {order.customer.state} · {order.paymentMethod}
            </span>
          </span>
        </button>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-display text-xl text-[color:var(--brand-deep)]">{formatPrice(order.total)}</span>
          <label className="sr-only" htmlFor={`status-${order.id}`}>Order status</label>
          <select
            id={`status-${order.id}`}
            value={order.status}
            disabled={saving}
            onChange={(e) => changeStatus(e.target.value as OrderStatus)}
            className="min-h-11 rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 text-xs font-bold uppercase tracking-wider"
          >
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {/* Phones: one small card per seller split */}
      <ul className="mt-4 space-y-2 sm:hidden">
        {order.sellerSplits.map((split) => (
          <li key={split.sellerId} className="rounded-xl bg-[color:var(--brand-cream)] p-3 text-xs">
            <p className="font-semibold text-[color:var(--brand-deep)]">{split.sellerId === PLATFORM_SELLER_ID ? `${SITE_NAME} (own stock)` : split.sellerName}</p>
            <dl className="mt-2 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
              <div><dt className="text-[color:var(--brand-charcoal)]/55">Gross</dt><dd className="font-semibold">{formatPrice(split.grossAmount)}</dd></div>
              <div><dt className="text-[color:var(--brand-charcoal)]/55">Commission</dt><dd className="font-semibold">{formatPrice(split.commissionAmount)}</dd></div>
              <div><dt className="text-[color:var(--brand-charcoal)]/55">Seller gets</dt><dd className="font-semibold text-emerald-700">{formatPrice(split.sellerAmount)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--brand-charcoal)]/55">
            <tr>
              <th className="py-2 pr-3">Seller</th>
              <th className="py-2 pr-3">Gross</th>
              <th className="py-2 pr-3">Platform commission</th>
              <th className="py-2">Seller receives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--brand-border)]">
            {order.sellerSplits.map((split) => (
              <tr key={split.sellerId}>
                <td className="py-2 pr-3 font-semibold">{split.sellerId === PLATFORM_SELLER_ID ? `${SITE_NAME} (own stock)` : split.sellerName}</td>
                <td className="py-2 pr-3">{formatPrice(split.grossAmount)}</td>
                <td className="py-2 pr-3">{formatPrice(split.commissionAmount)}</td>
                <td className="py-2 font-semibold text-emerald-700">{formatPrice(split.sellerAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="mt-4 space-y-2 border-t border-[color:var(--brand-border)] pt-4 text-xs">
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.type ?? ""}-${item.color}-${item.size}`} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {item.quantity} × <strong>{item.name}</strong> ({formatLineOptions(item)}) · {item.sellerName}
              </span>
              <span>
                {formatPrice(item.lineTotal)} → commission {formatPrice(item.commissionAmount)} ({item.commissionPercent}%) · seller {formatPrice(item.sellerAmount)}
              </span>
            </div>
          ))}
          <p className="pt-2 text-[color:var(--brand-charcoal)]/65">
            Subtotal {formatPrice(order.subtotal)} · Shipping {formatPrice(order.shippingCost)} · Total {formatPrice(order.total)} · Commission {formatPrice(order.commissionTotal)}
          </p>
          <p className="text-[color:var(--brand-charcoal)]/65">Deliver to: {order.customer.address}, {order.customer.city}, {order.customer.state} · {order.customer.phone} · {order.customer.email}</p>
        </div>
      )}
    </Card>
  );
}
