"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, ImagePlus, LoaderCircle, Pause, Pencil, Play, Store, Trash2 } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import { StatusBadge } from "@/components/status-badge";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { deleteListing, deleteMyAccount, setListingPaused, updateFulfilment, updateListing, updateSellerProfile, uploadListingImage } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { PHOTO_ACCEPT } from "@/lib/image-utils";
import type { FulfilmentStatus, ListingUpdateInput, Product, Seller, SellerOrderView } from "@/lib/types";

const smallButton =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50 disabled:opacity-50";

/** Shown above the dashboard while the store isn't live. */
export function StoreStatusBanner({ seller }: { seller: Seller }) {
  if (seller.status === "active") return null;
  const text =
    seller.status === "pending"
      ? "Your store is waiting for approval. You can add listings now; they go live once the store and each listing are approved."
      : seller.status === "rejected"
        ? `Your store application wasn't approved${seller.statusReason ? `: ${seller.statusReason}` : "."} Contact us from the Help page if you have questions.`
        : `Your store is suspended${seller.statusReason ? `: ${seller.statusReason}` : "."} Your listings are hidden from the shop.`;
  return (
    <p role="status" className={`mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${seller.status === "pending" ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800"}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}

/** One listing with quick edit (title, price, stock), pause/resume and delete. */
export function ListingRow({ item, onChanged }: { item: Product; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const [stock, setStock] = useState(String(item.stock));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const changes: ListingUpdateInput = { price: Number(price.replace(/\D/g, "")), stock: Number(stock) };
    // Only send the title when it changed: a new title on a live listing sends it back for review.
    if (name.trim() !== item.name) changes.name = name;
    run(() => updateListing(item.id, changes));
  }

  return (
    <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--brand-ivory)]">
          <SmartImage src={item.images[0]} alt={item.name} fill sizes="80px" className="object-cover object-top" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[color:var(--brand-deep)]">{item.name}</h3>
            <StatusBadge status={item.status} />
            {item.stock === 0 && <span className="text-[11px] font-bold uppercase text-red-700">Sold out</span>}
          </div>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">
            {formatPrice(item.price)} · {item.stock} in stock · {item.colors.length} colour{item.colors.length === 1 ? "" : "s"} · Submitted {formatDate(item.createdAt)}
          </p>
          {item.status === "rejected" && item.rejectionReason && (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span><strong>Rejected:</strong> {item.rejectionReason} Fix it with Edit and it goes back for review.</span>
            </p>
          )}
          {item.status === "pending" && <p className="mt-2 text-xs text-amber-700">Waiting for review by our team.</p>}
          {item.status === "paused" && <p className="mt-2 text-xs text-[color:var(--brand-charcoal)]/65">Paused: hidden from the shop until you resume it.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === "approved" && (
            <Link href={`/product/${item.slug}`} className={smallButton}>View</Link>
          )}
          <button type="button" className={smallButton} onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
          </button>
          {(item.status === "approved" || item.status === "paused") && (
            <button type="button" disabled={busy} className={smallButton} onClick={() => run(() => setListingPaused(item.id, item.status === "approved"))}>
              {item.status === "approved" ? <><Pause className="h-3.5 w-3.5" aria-hidden="true" /> Pause</> : <><Play className="h-3.5 w-3.5" aria-hidden="true" /> Resume</>}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            className={`${smallButton} text-red-700`}
            onClick={() => {
              if (window.confirm(`Delete "${item.name}"? This can't be undone.`)) run(() => deleteListing(item.id));
            }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={onSave} noValidate className="mt-4 grid gap-3 border-t border-[color:var(--brand-border)] pt-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor={`edit-name-${item.id}`} className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Title</label>
            <input id={`edit-name-${item.id}`} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={90} />
          </div>
          <div>
            <label htmlFor={`edit-price-${item.id}`} className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Price (₦)</label>
            <input id={`edit-price-${item.id}`} inputMode="numeric" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          <div>
            <label htmlFor={`edit-stock-${item.id}`} className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Stock</label>
            <input id={`edit-stock-${item.id}`} type="number" min={0} inputMode="numeric" className={inputClass} value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Save
          </button>
          {(item.status === "approved" || item.status === "paused") && (
            <p className="text-xs text-[color:var(--brand-charcoal)]/65 sm:col-span-4">Price and stock changes go live straight away. A new title is reviewed by our team first.</p>
          )}
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

const FULFILMENT_LABELS: Record<FulfilmentStatus, string> = { processing: "Preparing", shipped: "Shipped", delivered: "Delivered" };

/** Fulfilment status control for the seller's part of one order. */
export function FulfilmentControl({ order, onChanged }: { order: SellerOrderView; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!order.paid) return <p className="text-xs text-amber-700">Waiting for payment. Don&apos;t ship yet.</p>;
  if (order.status === "cancelled") return null;

  async function change(event: ChangeEvent<HTMLSelectElement>) {
    setBusy(true);
    setError("");
    try {
      await updateFulfilment(order.orderId, event.target.value as FulfilmentStatus);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`fulfil-${order.orderId}`} className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Your part</label>
      <select id={`fulfil-${order.orderId}`} value={order.fulfilment} onChange={change} disabled={busy} className="min-h-11 rounded-full border border-[color:var(--brand-border)] bg-white px-3 text-base font-semibold text-[color:var(--brand-deep)] sm:text-sm">
        {(Object.keys(FULFILMENT_LABELS) as FulfilmentStatus[]).map((status) => (
          <option key={status} value={status}>{FULFILMENT_LABELS[status]}</option>
        ))}
      </select>
      {busy && <LoaderCircle className="h-4 w-4 animate-spin text-[color:var(--brand-primary)]" />}
      {error && <p role="alert" className="w-full text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

/** Store name, logo and bio shown on the public storefront (/sellers/[id]). */
export function StoreProfileForm({ seller, onSaved }: { seller: Seller; onSaved: () => void }) {
  const [businessName, setBusinessName] = useState(seller.businessName);
  const [bio, setBio] = useState(seller.bio ?? "");
  const [logo, setLogo] = useState<string | null>(seller.logo ?? null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      setLogo(await uploadListingImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that logo.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await updateSellerProfile({ businessName, bio, logo });
      setMessage("Store profile saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl border border-[color:var(--brand-border)] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]">
          {logo ? <SmartImage src={logo} alt="Store logo" fill sizes="80px" className="object-cover" /> : <Store className="h-7 w-7 text-[color:var(--brand-primary)]" aria-hidden="true" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor="store-logo" className={`${secondaryButtonClass} cursor-pointer`}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> {logo ? "Change logo" : "Add logo"}
          </label>
          <input id="store-logo" type="file" accept={PHOTO_ACCEPT} className="sr-only" onChange={onLogo} disabled={busy} />
          {logo && <button type="button" className={secondaryButtonClass} onClick={() => setLogo(null)}>Remove</button>}
        </div>
      </div>
      <div>
        <label htmlFor="store-name" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Store name</label>
        <input id="store-name" className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={80} />
      </div>
      <div>
        <label htmlFor="store-bio" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">About your store</label>
        <textarea id="store-bio" rows={4} className={inputClass} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={600} placeholder="What you make or sell, where you're based, what makes your pieces special." />
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryButtonClass}>{busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Save profile</button>
        {seller.status === "active" && <Link href={`/sellers/${seller.id}`} className={secondaryButtonClass}>View my store</Link>}
      </div>
    </form>
  );
}

/** Lets a seller permanently delete their own account. Asks for their password first. */
export function DeleteAccountPanel({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete your account.");
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-red-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-red-700">Delete account</h2>
      <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/75">
        This removes your store and all your listings for good. It can&apos;t be undone. Orders you already received stay on record.
      </p>
      {!open ? (
        <button type="button" className={`${smallButton} mt-3 border-red-200 text-red-700`} onClick={() => setOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete my account
        </button>
      ) : (
        <form onSubmit={onConfirm} noValidate className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="delete-password" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Enter your password to confirm</label>
            <input id="delete-password" type="password" autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={busy || !password} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50">
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Delete forever
          </button>
          <button type="button" className={smallButton} onClick={() => { setOpen(false); setPassword(""); setError(""); }}>Cancel</button>
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </section>
  );
}
