"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, LoaderCircle, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Card, inputClass } from "@/components/ui/form";
import { deleteSeller, resolveReport, setSellerStatus } from "@/lib/api";
import { CATEGORIES } from "@/lib/config";
import { formatDate, formatPrice } from "@/lib/format";
import type { ListingReport, PayoutStatus, PayoutSummary, Product, Seller, SellerStatus } from "@/lib/types";

const smallButton =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[color:var(--brand-border)] bg-white px-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 disabled:opacity-50";

/** Approve / reject / suspend / reactivate a seller store. Reject and suspend need a reason. */
export function SellerStatusActions({ seller, onChanged }: { seller: Seller; onChanged: () => void }) {
  const [pendingAction, setPendingAction] = useState<SellerStatus | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await deleteSeller(seller.id);
      setConfirmDelete(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the seller.");
    } finally {
      setBusy(false);
    }
  }

  async function apply(status: SellerStatus, why?: string) {
    setBusy(true);
    setError("");
    try {
      await setSellerStatus(seller.id, status, why);
      setPendingAction(null);
      setReason("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the seller.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-[color:var(--brand-border)] pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={seller.status} />
        {seller.statusReason && <span className="text-xs text-[color:var(--brand-charcoal)]/65">“{seller.statusReason}”</span>}
        <span className="flex-1" />
        {seller.status !== "active" && (
          <button type="button" disabled={busy} className={smallButton} onClick={() => apply("active")}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> {seller.status === "pending" ? "Approve store" : "Reactivate"}
          </button>
        )}
        {seller.status === "pending" && (
          <button type="button" disabled={busy} className={`${smallButton} text-red-700`} onClick={() => setPendingAction("rejected")}>Reject</button>
        )}
        {seller.status === "active" && (
          <button type="button" disabled={busy} className={`${smallButton} text-red-700`} onClick={() => setPendingAction("suspended")}>Suspend</button>
        )}
        <button type="button" disabled={busy} className={`${smallButton} text-red-700`} onClick={() => { setPendingAction(null); setConfirmDelete(true); }}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
        </button>
      </div>
      {confirmDelete && (
        <div role="alertdialog" aria-label="Delete seller" className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
          <p>Delete <strong>{seller.businessName}</strong> and all their listings for good? Past orders stay on record. This can&apos;t be undone.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50" onClick={remove}>
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Delete seller
            </button>
            <button type="button" className={smallButton} onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        </div>
      )}
      {pendingAction && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor={`seller-reason-${seller.id}`} className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Reason (sent to the seller)
            </label>
            <input id={`seller-reason-${seller.id}`} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button type="button" disabled={busy || !reason.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50" onClick={() => apply(pendingAction, reason)}>
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Confirm {pendingAction === "rejected" ? "rejection" : "suspension"}
          </button>
          <button type="button" className={smallButton} onClick={() => setPendingAction(null)}>Cancel</button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

const REASON_LABELS: Record<ListingReport["reason"], string> = {
  counterfeit: "Fake / counterfeit",
  wrong_info: "Wrong details",
  prohibited: "Not allowed",
  offensive: "Offensive",
  scam: "Possible scam",
  other: "Other",
};

export function ReportsPanel({ reports, onChanged }: { reports: ListingReport[]; onChanged: () => void }) {
  const [busyId, setBusyId] = useState("");
  if (reports.length === 0) return <Card className="text-center text-sm text-[color:var(--brand-charcoal)]/70">No reported listings.</Card>;
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[color:var(--brand-deep)]">
                <Link href={`/product/${report.productSlug}`} className="hover:underline">{report.productName}</Link>
                <span className="font-normal text-[color:var(--brand-charcoal)]/65"> · {report.sellerName}</span>
              </p>
              <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                <strong>{REASON_LABELS[report.reason]}</strong>
                {report.details && <> · {report.details}</>}
              </p>
              <p className="mt-1 text-[11px] text-[color:var(--brand-charcoal)]/55">
                {formatDate(report.createdAt)}
                {report.email && <> · {report.email}</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              {report.status === "open" && (
                <button
                  type="button"
                  disabled={busyId === report.id}
                  className={smallButton}
                  onClick={async () => {
                    setBusyId(report.id);
                    try {
                      await resolveReport(report.id);
                      onChanged();
                    } finally {
                      setBusyId("");
                    }
                  }}
                >
                  Mark resolved
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
      <p className="text-xs text-[color:var(--brand-charcoal)]/60">To take a listing down, reject it from All products; to stop a seller, suspend them from Sellers.</p>
    </div>
  );
}

const PAYOUT_LABEL: Record<PayoutStatus, string> = { not_set_up: "Not set up", pending: "Verifying", active: "Active", on_hold: "On hold" };

export function PayoutsPanel({ rows }: { rows: PayoutSummary[] }) {
  if (rows.length === 0) return <Card className="text-center text-sm text-[color:var(--brand-charcoal)]/70">No sellers yet.</Card>;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-xs">
        <caption className="pb-3 text-left text-[color:var(--brand-charcoal)]/65">
          Seller share of paid orders. Transfers are made by the backend (see BACKEND.md, payouts); the demo store never moves money.
        </caption>
        <thead className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--brand-charcoal)]/55">
          <tr>
            <th scope="col" className="py-2 pr-3">Seller</th>
            <th scope="col" className="py-2 pr-3">Bank</th>
            <th scope="col" className="py-2 pr-3">Payout status</th>
            <th scope="col" className="py-2 pr-3">Earned</th>
            <th scope="col" className="py-2 pr-3">Paid out</th>
            <th scope="col" className="py-2">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--brand-border)]">
          {rows.map((row) => (
            <tr key={row.sellerId}>
              <th scope="row" className="py-2 pr-3 font-semibold">{row.sellerName}</th>
              <td className="py-2 pr-3">{row.bankName} ••••{row.accountLast4}</td>
              <td className="py-2 pr-3">{PAYOUT_LABEL[row.payoutStatus]}</td>
              <td className="py-2 pr-3">{formatPrice(row.earned)}</td>
              <td className="py-2 pr-3">{formatPrice(row.paidOut)}</td>
              <td className="py-2 font-bold text-emerald-700">{formatPrice(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Category list with live / pending counts. Categories themselves are defined in src/lib/config.ts. */
export function CategoriesPanel({ products }: { products: Product[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-xs">
        <caption className="pb-3 text-left text-[color:var(--brand-charcoal)]/65">
          A category shows in the shop and menus once it has a live product. Add or rename categories in CATEGORIES (src/lib/config.ts) and the backend together.
        </caption>
        <thead className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--brand-charcoal)]/55">
          <tr>
            <th scope="col" className="py-2 pr-3">Category</th>
            <th scope="col" className="py-2 pr-3">Live</th>
            <th scope="col" className="py-2 pr-3">Pending</th>
            <th scope="col" className="py-2">In the shop</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--brand-border)]">
          {CATEGORIES.map((category) => {
            const inCategory = products.filter((product) => product.category === category.slug);
            const live = inCategory.filter((product) => product.status === "approved").length;
            return (
              <tr key={category.slug}>
                <th scope="row" className="py-2 pr-3 font-semibold">
                  <Link href={`/category/${category.slug}`} className="hover:underline">{category.name}</Link>
                </th>
                <td className="py-2 pr-3">{live}</td>
                <td className="py-2 pr-3">{inCategory.filter((product) => product.status === "pending").length}</td>
                <td className="py-2">{live > 0 ? "Visible" : "Hidden (empty)"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
