"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Flag, LoaderCircle, MessageCircle, Ruler, Star, Truck } from "lucide-react";

import { useAsync } from "@/hooks/use-async";
import { addReview, getReviews, reportListing } from "@/lib/api";
import { DELIVERY_ESTIMATES, RETURN_WINDOW_DAYS, SHIPPING_RATES, SITE_NAME, whatsappLink } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { Product, ReportReason, ReviewSummary } from "@/lib/types";

const panel = "rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-xs text-[color:var(--brand-charcoal)]/85";
const summaryClass = "flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-[color:var(--brand-deep)]";
const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3.5 py-2.5 text-base text-[color:var(--brand-charcoal)] outline-none focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/20 sm:text-sm";

/** Approximate body measurements in cm (generic ready-to-wear chart). Review and adjust before launch. */
const ADULT_SIZES = [
  ["XS", "80–84", "62–66", "86–90"],
  ["S", "86–90", "70–74", "92–96"],
  ["M", "94–98", "78–82", "100–104"],
  ["L", "102–106", "86–90", "108–112"],
  ["XL", "110–114", "94–98", "116–120"],
  ["XXL", "118–122", "102–106", "124–128"],
  ["3XL", "126–130", "110–114", "132–136"],
];
const KIDS_SIZES = [
  ["2–3Y", "92–98"],
  ["4–5Y", "104–110"],
  ["6–7Y", "116–122"],
  ["8–9Y", "128–134"],
  ["10–11Y", "140–146"],
];

/** Size guide, delivery & returns and a WhatsApp question, as compact disclosures under the buy box. */
export function ProductInfoPanels({ product }: { product: Product }) {
  const ask = whatsappLink(`Hello ${SITE_NAME}, I have a question about "${product.name}" (${product.slug}).`);
  const kids = product.gender === "kids" || product.sizes.some((size) => /\dY$/i.test(size));
  return (
    <div className="space-y-2">
      <details className={panel}>
        <summary className={summaryClass}>
          <Ruler className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" /> Size guide
        </summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[280px] text-left">
            <caption className="pb-2 text-left text-[11px] text-[color:var(--brand-charcoal)]/65">
              Body measurements in cm. Between sizes? Pick the larger one for a relaxed fit.
            </caption>
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[color:var(--brand-deep)]">
                {(kids ? ["Size", "Height"] : ["Size", "Chest", "Waist", "Hips"]).map((h) => (
                  <th key={h} scope="col" className="py-1.5 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(kids ? KIDS_SIZES : ADULT_SIZES).map((row) => (
                <tr key={row[0]} className={`border-t border-[color:var(--brand-border)] ${product.sizes.includes(row[0]) ? "font-semibold text-[color:var(--brand-deep)]" : ""}`}>
                  {row.map((cell, index) => (index === 0 ? <th key={index} scope="row" className="py-1.5 pr-3">{cell}</th> : <td key={index} className="py-1.5 pr-3">{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          {product.fit && <p className="mt-2">Fit: {product.fit}</p>}
        </div>
      </details>

      <details className={panel}>
        <summary className={summaryClass}>
          <Truck className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" /> Delivery &amp; returns
        </summary>
        <ul className="space-y-1 px-4 pb-4 [&_li]:ml-4 [&_li]:list-disc">
          <li>Standard {formatPrice(SHIPPING_RATES.standard)} · {DELIVERY_ESTIMATES.standard}</li>
          <li>Priority {formatPrice(SHIPPING_RATES.priority)} · {DELIVERY_ESTIMATES.priority.toLowerCase()}</li>
          <li>Shipped by {product.sellerName}. Returns within {RETURN_WINDOW_DAYS} days of delivery for unworn items.</li>
          <li><Link href="/delivery-returns" className="font-semibold underline">Full delivery &amp; returns policy</Link></li>
        </ul>
      </details>

      {ask && (
        <a href={ask} target="_blank" rel="noopener noreferrer" className={`${panel} ${summaryClass} hover:bg-white`}>
          <MessageCircle className="h-4 w-4 text-[#1f7a4d]" aria-hidden="true" /> Ask about this item on WhatsApp
        </a>
      )}
    </div>
  );
}

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-[color:var(--brand-gold)] text-[color:var(--brand-gold)]" : "text-[color:var(--brand-border)]"}`} />
      ))}
    </span>
  );
}

/** Short rating line for the top of the product page. */
export function RatingSummary({ productId }: { productId: string }) {
  const { data } = useAsync(() => getReviews(productId), [productId]);
  if (!data || data.count === 0) return null;
  return (
    <a href="#reviews" className="inline-flex min-h-11 items-center gap-2 text-sm text-[color:var(--brand-charcoal)]/75 hover:underline">
      <Stars value={data.average} />
      <span>
        {data.average.toFixed(1)} <span className="sr-only">out of 5 stars</span>({data.count} review{data.count === 1 ? "" : "s"})
      </span>
    </a>
  );
}

/** Reviews list + "write a review" form. */
export function ProductReviews({ productId }: { productId: string }) {
  const { data, reload } = useAsync(() => getReviews(productId), [productId]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);
  const shown = summary ?? data;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!rating) return setError("Choose a star rating.");
    setBusy(true);
    try {
      setSummary(await addReview(productId, { name, rating, comment }));
      setOpen(false);
      setThanks(true);
      setRating(0);
      setComment("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reviews-title" className="font-display text-2xl text-[color:var(--brand-deep)] sm:text-3xl">Reviews</h2>
          {shown && shown.count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-[color:var(--brand-charcoal)]/75">
              <Stars value={shown.average} /> {shown.average.toFixed(1)} out of 5 · {shown.count} review{shown.count === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/65">No reviews yet. Bought it? Tell others what you think.</p>
          )}
        </div>
        {!open && (
          <button type="button" onClick={() => { setOpen(true); setThanks(false); }} className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--brand-deep)]/25 bg-white px-5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] hover:bg-[color:var(--brand-soft)]/50">
            Write a review
          </button>
        )}
      </div>

      {thanks && <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">Thanks, your review is up.</p>}

      {open && (
        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 sm:p-5">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Your rating</legend>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
                  <span className="flex h-11 w-11 items-center justify-center rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--brand-primary)]">
                    <Star aria-hidden="true" className={`h-6 w-6 ${n <= rating ? "fill-[color:var(--brand-gold)] text-[color:var(--brand-gold)]" : "text-[color:var(--brand-border)]"}`} />
                  </span>
                  <span className="sr-only">{n} star{n === 1 ? "" : "s"}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="review-name" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Name</label>
            <input id="review-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="review-comment" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Review</label>
            <textarea id="review-comment" rows={3} className={fieldClass} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Fit, fabric, quality, delivery…" />
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-6 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Post review
            </button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center px-4 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Cancel</button>
          </div>
        </form>
      )}

      {shown && shown.reviews.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {shown.reviews.slice(0, 10).map((review) => (
            <li key={review.id} className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-deep)]">
                  <Stars value={review.rating} size="h-3.5 w-3.5" /> <span className="sr-only">{review.rating} out of 5 stars, by</span>{review.name}
                </span>
                <time dateTime={review.createdAt} className="text-[11px] text-[color:var(--brand-charcoal)]/55">
                  {new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </time>
              </div>
              <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/80">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "counterfeit", label: "Fake or counterfeit" },
  { value: "wrong_info", label: "Wrong photos, price or details" },
  { value: "prohibited", label: "Not allowed on the store" },
  { value: "offensive", label: "Offensive content" },
  { value: "scam", label: "Looks like a scam" },
  { value: "other", label: "Something else" },
];

/** "Report this listing" link that opens a small inline form. */
export function ReportListing({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("wrong_info");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await reportListing(productId, { reason, details, email });
      setSent(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the report.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return <p role="status" className="text-xs font-semibold text-[color:var(--brand-deep)]">Thanks. Our team will review this listing.</p>;

  return (
    <div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-charcoal)]/65 underline hover:text-[color:var(--brand-deep)]">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report this listing
        </button>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-3 rounded-2xl border border-[color:var(--brand-border)] bg-white p-4">
          <h3 className="text-sm font-bold text-[color:var(--brand-deep)]">Report this listing</h3>
          <div>
            <label htmlFor="report-reason" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">What&apos;s wrong?</label>
            <select id="report-reason" className={fieldClass} value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
              {REPORT_REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="report-details" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Details {reason !== "other" && "(optional)"}</label>
            <textarea id="report-details" rows={2} className={fieldClass} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} />
          </div>
          <div>
            <label htmlFor="report-email" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Your email (optional)</label>
            <input id="report-email" type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Send report
            </button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center px-4 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
