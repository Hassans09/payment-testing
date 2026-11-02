"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Plus, Star, Trash2, X } from "lucide-react";

import { ChipInput } from "@/components/ui/chip-input";
import { SmartImage } from "@/components/smart-image";
import { Card, ErrorNote, Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { useSellerSession } from "@/hooks/use-session";
import { createListing, uploadListingImage } from "@/lib/api";
import { CATEGORIES, PLATFORM_COMMISSION_PERCENT, isCategorySlug, type CategorySlug } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { moveItem } from "@/lib/image-utils";
import type { ColorVariant, Gender } from "@/lib/types";

const MAX_IMAGES = 8;

const PRODUCT_TYPE_SUGGESTIONS = [
  "Shirt", "T-shirt", "Polo", "Trousers", "Jeans", "Shorts", "Dress", "Skirt", "Top", "Blouse",
  "Kaftan", "Abaya", "Jalabiya", "Agbada", "Senator", "Suit", "Jacket", "Hoodie", "Two-piece set",
  "Kids' wear", "Shoes", "Sneakers", "Sandals", "Slippers", "Bag", "Cap", "Hat", "Belt", "Scarf",
  "Jewellery", "Watch", "Sunglasses",
];

const SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One size", "2-3Y", "4-5Y", "6-7Y", "38", "40", "42", "44"];

type ColorDraft = ColorVariant & { key: number };
type GenderChoice = Gender | "";

export default function NewListingPage() {
  const router = useRouter();
  const { seller, loading } = useSellerSession();
  const keyCounter = useRef(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [productType, setProductType] = useState("");
  const [gender, setGender] = useState<GenderChoice>("");
  const [material, setMaterial] = useState("");
  const [optionLabel, setOptionLabel] = useState("");
  const [optionValues, setOptionValues] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorDraft[]>([{ key: 0, name: "", hex: "#1D2840" }]);
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [processing, setProcessing] = useState<{ done: number; total: number } | null>(null);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const uploading = processing !== null;
  const priceNumber = Number(price.replace(/[^\d]/g, ""));
  const commission = Math.round((priceNumber * PLATFORM_COMMISSION_PERCENT) / 100);

  /**
   * Handles one or many photos from the gallery/camera. Each photo is compressed
   * on its own; a bad photo is reported but doesn't stop the others, and each
   * good one appears as soon as it's ready.
   */
  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    // Copy the FileList BEFORE clearing the input (clearing empties the live list).
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_IMAGES - images.length;
    const accepted = files.slice(0, Math.max(0, room));
    const problems: string[] = [];
    if (files.length > accepted.length) {
      problems.push(`Only ${MAX_IMAGES} photos per listing, so ${files.length - accepted.length} ${files.length - accepted.length === 1 ? "was" : "were"} skipped.`);
    }
    if (accepted.length === 0) {
      setPhotoErrors(problems);
      return;
    }

    setError("");
    setPhotoErrors([]);
    setProcessing({ done: 0, total: accepted.length });

    for (let index = 0; index < accepted.length; index += 1) {
      try {
        const url = await uploadListingImage(accepted[index]);
        setImages((current) => (current.length < MAX_IMAGES ? [...current, url] : current));
      } catch (err) {
        problems.push(err instanceof Error ? err.message : `Couldn't add "${accepted[index].name}".`);
      }
      setProcessing({ done: index + 1, total: accepted.length });
    }

    setProcessing(null);
    setPhotoErrors(problems);
  }

  async function handleColorImage(key: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProcessing({ done: 0, total: 1 });
    setPhotoErrors([]);
    try {
      const url = await uploadListingImage(file);
      setColors((current) => current.map((color) => (color.key === key ? { ...color, image: url } : color)));
    } catch (err) {
      setPhotoErrors([err instanceof Error ? err.message : "Could not add that photo."]);
    } finally {
      setProcessing(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanColors = colors.filter((color) => color.name.trim());
    if (images.length === 0) return setError("Please add at least one photo.");
    if (!name.trim()) return setError("Please add a title.");
    if (!isCategorySlug(category)) return setError("Please choose a category.");
    if (description.trim().length < 20) return setError("Please write a description of at least 20 characters (fabric, fit, what's included).");
    if (sizes.length === 0) return setError("Add at least one size (type it and press Enter), e.g. M or One size.");
    if (cleanColors.length === 0) return setError("Add at least one colour with a name.");
    if (!(priceNumber > 0)) return setError("Please enter a price in Naira.");
    if (optionValues.length === 1) return setError("Add at least two options (e.g. Short and Long), or remove the option.");

    setSubmitting(true);
    try {
      await createListing({
        name,
        description,
        category,
        ...(productType.trim() ? { productType: productType.trim() } : {}),
        ...(gender ? { gender } : {}),
        typeOption: optionValues.length > 1 ? { label: optionLabel.trim() || "Type", values: optionValues } : null,
        sizes,
        colors: cleanColors.map(({ name: colorName, hex, image }) => ({ name: colorName.trim(), hex, ...(image ? { image } : {}) })),
        images,
        price: priceNumber,
        stock: Math.max(0, Number(stock) || 0),
        material,
      });
      router.push("/seller/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your listing.");
      setSubmitting(false);
    }
  }

  if (loading || !seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/70 hover:text-[color:var(--brand-deep)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">New listing</h1>
      <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">
        Any clothing, shoes, bags or accessories. Listings are reviewed by our team before they appear in the shop as &ldquo;Sold by {seller.businessName}&rdquo;.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        <ErrorNote message={error} />

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Photos</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">
            Up to {MAX_IMAGES} photos (JPG, PNG, WEBP or HEIC). You can pick several at once. The first photo is the cover; use the arrows to reorder.
          </p>
          <div className="mt-4 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3 sm:grid-cols-4">
            {images.map((src, index) => (
              <div key={`${index}-${src.length}-${src.slice(-16)}`} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)]">
                <SmartImage src={src} alt={`Photo ${index + 1}`} fill sizes="160px" className="object-cover" />
                {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-[color:var(--brand-deep)] px-2 py-0.5 text-[9px] font-bold uppercase text-white">Cover</span>}
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow"
                >
                  <X className="h-4 w-4" />
                </button>
                {images.length > 1 && (
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      aria-label={`Move photo ${index + 1} left`}
                      disabled={index === 0}
                      onClick={() => setImages((current) => moveItem(current, index, index - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[color:var(--brand-deep)] shadow disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {index !== 0 && (
                      <button
                        type="button"
                        aria-label={`Make photo ${index + 1} the cover`}
                        onClick={() => setImages((current) => moveItem(current, index, 0))}
                        className="flex h-8 items-center gap-1 rounded-full bg-white/95 px-2 text-[9px] font-bold uppercase text-[color:var(--brand-deep)] shadow"
                      >
                        <Star className="h-3 w-3" /> Cover
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Move photo ${index + 1} right`}
                      disabled={index === images.length - 1}
                      onClick={() => setImages((current) => moveItem(current, index, index + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[color:var(--brand-deep)] shadow disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {processing &&
              Array.from({ length: Math.max(0, processing.total - processing.done) }).map((_, index) => (
                <div key={`pending-${index}`} className="flex aspect-[3/4] animate-pulse items-center justify-center rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)]">
                  <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--brand-primary)]" />
                </div>
              ))}

            {images.length < MAX_IMAGES && !processing && (
              // A <label> for the input works on every phone browser (no programmatic click needed).
              <label
                htmlFor="listing-photos"
                className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-center text-xs font-semibold text-[color:var(--brand-deep)] hover:border-[color:var(--brand-primary)]"
              >
                <ImagePlus className="h-5 w-5" />
                {images.length === 0 ? "Add photos" : "Add more"}
              </label>
            )}
          </div>
          {/* sr-only (not display:none) so the picker opens reliably on iOS and Android. */}
          <input
            id="listing-photos"
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="sr-only"
            onChange={handleImages}
            disabled={uploading}
          />
          {processing && (
            <p className="mt-3 text-xs font-semibold text-[color:var(--brand-deep)]" aria-live="polite">
              Preparing photo {Math.min(processing.done + 1, processing.total)} of {processing.total}…
            </p>
          )}
          {photoErrors.length > 0 && (
            <ul role="alert" className="mt-3 space-y-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              {photoErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" className="sm:col-span-2">
              <input id="title" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oversized Linen Shirt" maxLength={90} />
            </Field>
            <Field label="Category" htmlFor="category" hint="Where shoppers will find it.">
              <select
                id="category"
                required
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug | "")}
              >
                <option value="" disabled>
                  Choose a category…
                </option>
                {CATEGORIES.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Product type (optional)" htmlFor="product-type" hint="A more specific detail, e.g. Oversized shirt, Ankara tote.">
              <input
                id="product-type"
                list="product-type-suggestions"
                className={inputClass}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="e.g. Oversized shirt, sneakers, tote bag"
                maxLength={40}
              />
              <datalist id="product-type-suggestions">
                {PRODUCT_TYPE_SUGGESTIONS.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>
            <Field label="Gender (optional)" htmlFor="gender">
              <select id="gender" className={inputClass} value={gender} onChange={(e) => setGender(e.target.value as GenderChoice)}>
                <option value="">Not specified</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Description" htmlFor="description" className="sm:col-span-2" hint="Fabric, fit, occasion, what's included.">
              <textarea id="description" rows={4} className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="Fabric / material (optional)" htmlFor="material" className="sm:col-span-2">
              <input id="material" className={inputClass} value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 100% cotton, leather" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Sizes</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">Type a size and press Enter (or comma). Tap a suggestion to add it.</p>
          <ChipInput
            id="sizes"
            label="Sizes"
            values={sizes}
            onChange={setSizes}
            placeholder="e.g. M, L, XL, 42, One size"
            suggestions={SIZE_SUGGESTIONS}
          />
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Colours</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">Add each colour you sell. A photo per colour is optional, but shoppers love it.</p>
          <div className="mt-4 space-y-3">
            {colors.map((color, index) => (
              <div key={color.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-3">
                <input
                  type="color"
                  aria-label={`Colour ${index + 1} swatch`}
                  value={color.hex}
                  onChange={(e) => setColors((current) => current.map((c) => (c.key === color.key ? { ...c, hex: e.target.value } : c)))}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-full border border-black/10 bg-transparent p-0.5"
                />
                <input
                  aria-label={`Colour ${index + 1} name`}
                  className={`${inputClass} mt-0 min-w-0 flex-1 bg-white`}
                  value={color.name}
                  onChange={(e) => setColors((current) => current.map((c) => (c.key === color.key ? { ...c, name: e.target.value } : c)))}
                  placeholder="Colour name, e.g. Navy"
                />
                <input
                  aria-label={`Colour ${index + 1} hex code`}
                  className={`${inputClass} mt-0 w-28 bg-white font-mono text-xs uppercase`}
                  value={color.hex}
                  maxLength={7}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    const next = raw.startsWith("#") ? raw : `#${raw}`;
                    setColors((current) => current.map((c) => (c.key === color.key ? { ...c, hex: next } : c)));
                  }}
                  onBlur={() => {
                    if (!/^#[0-9a-fA-F]{6}$/.test(color.hex)) {
                      setColors((current) => current.map((c) => (c.key === color.key ? { ...c, hex: "#1D2840" } : c)));
                    }
                  }}
                />
                <label className="relative flex h-14 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/60" title="Photo for this colour (optional)">
                  {color.image ? (
                    <SmartImage src={color.image} alt={`${color.name || "Colour"} photo`} fill sizes="44px" className="object-cover" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  <input type="file" accept="image/*,.heic,.heif" className="sr-only" onChange={(e) => handleColorImage(color.key, e)} disabled={uploading} />
                </label>
                {color.image && (
                  <button
                    type="button"
                    aria-label={`Remove photo for colour ${index + 1}`}
                    onClick={() => setColors((current) => current.map((c) => (c.key === color.key ? { key: c.key, name: c.name, hex: c.hex } : c)))}
                    className="text-[11px] font-semibold text-red-600 underline"
                  >
                    Remove photo
                  </button>
                )}
                {colors.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove colour ${index + 1}`}
                    onClick={() => setColors((current) => current.filter((c) => c.key !== color.key))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${secondaryButtonClass} mt-3`}
            onClick={() => {
              const key = keyCounter.current++;
              setColors((current) => [...current, { key, name: "", hex: "#7B1E2B" }]);
            }}
          >
            <Plus className="h-4 w-4" /> Add colour
          </button>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Options (optional)</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">
            An extra choice shoppers make before adding to the bag, e.g. Length: Short / Long, or Set: Top only / Top + trousers.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[0.6fr_1.4fr]">
            <Field label="Option name" htmlFor="option-label">
              <input id="option-label" className={inputClass} value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} placeholder="e.g. Length" maxLength={24} />
            </Field>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">Choices</span>
              <ChipInput id="option-values" label="Option choices" values={optionValues} onChange={setOptionValues} placeholder="e.g. Short, Long" />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Price &amp; stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₦)" htmlFor="price">
              <input id="price" inputMode="numeric" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} placeholder="25000" />
            </Field>
            <Field label="Stock (pieces available)" htmlFor="stock">
              <input id="stock" type="number" min={0} inputMode="numeric" className={inputClass} value={stock} onChange={(e) => setStock(e.target.value)} />
            </Field>
          </div>
          {priceNumber > 0 && (
            <p className="mt-4 rounded-2xl bg-[color:var(--brand-cream)] px-4 py-3 text-xs text-[color:var(--brand-charcoal)]/80">
              For each sale at {formatPrice(priceNumber)} you receive <strong className="text-emerald-700">{formatPrice(priceNumber - commission)}</strong> (platform commission {PLATFORM_COMMISSION_PERCENT}%: {formatPrice(commission)}).
            </p>
          )}
        </Card>

        <ErrorNote message={error} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/seller/dashboard" className={secondaryButtonClass}>Cancel</Link>
          <button type="submit" disabled={submitting || uploading} className={primaryButtonClass}>
            {(submitting || uploading) && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {uploading ? "Preparing photos…" : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
}
