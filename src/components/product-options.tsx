"use client";

import { Check } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import type { ColorVariant, Product } from "@/lib/types";

/** What the shopper picked. "" = not chosen yet. */
export type ProductSelection = {
  type: string;
  color: string;
  size: string;
};

/** Starting selection: the first colour, and type/size only when there is exactly one choice. */
export function initialSelection(product: Product): ProductSelection {
  const types = product.typeOption?.values ?? [];
  return {
    type: types.length === 1 ? types[0] : "",
    color: product.colors[0]?.name ?? "",
    size: product.sizes.length === 1 ? product.sizes[0] : "",
  };
}

/** Returns a friendly message for the first missing choice, or "" when everything is chosen. */
export function missingSelection(product: Product, selection: ProductSelection): string {
  const types = product.typeOption?.values ?? [];
  if (types.length > 0 && !selection.type) {
    return `Please choose a ${(product.typeOption?.label || "type").toLowerCase()}.`;
  }
  if (product.colors.length > 0 && !selection.color) return "Please choose a colour.";
  if (product.sizes.length > 0 && !selection.size) return "Please choose a size.";
  return "";
}

/** Photo for the chosen colour, falling back to the main product photo. */
export function imageForColor(product: Product, colorName: string): string {
  const variant = product.colors.find((color) => color.name === colorName);
  return variant?.image || variant?.images?.[0] || product.images[0];
}

export function isLightColor(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) return true;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 170;
}

const chipBase =
  "flex h-11 min-w-12 items-center justify-center rounded-2xl px-3.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary)]";
const chipOn = "bg-[color:var(--brand-deep)] text-white shadow-sm";
const chipOff =
  "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)] hover:border-[color:var(--brand-primary)]";

function GroupHeading({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
      <span>{label}</span>
      <span className="font-medium normal-case tracking-normal text-[color:var(--brand-charcoal)]/65">{value || "Choose"}</span>
    </div>
  );
}

function ColorSwatch({ color, selected, onClick }: { color: ColorVariant; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Colour ${color.name}`}
      aria-pressed={selected}
      title={color.name}
      className={`relative h-11 w-11 overflow-hidden rounded-full border transition ${
        selected
          ? "border-[color:var(--brand-deep)] ring-2 ring-[color:var(--brand-deep)] ring-offset-2"
          : "border-black/15 hover:scale-105"
      }`}
      style={{ backgroundColor: color.hex }}
    >
      {color.image && (
        <>
          <SmartImage src={color.image} alt="" fill sizes="44px" className="object-cover" />
          {/* thin ring of the real colour so the swatch reads as a colour, not just a photo */}
          <span className="absolute inset-0 rounded-full border-[5px]" style={{ borderColor: color.hex }} />
        </>
      )}
      {selected && (
        <Check
          className={`absolute inset-0 m-auto h-4 w-4 drop-shadow ${isLightColor(color.hex) ? "text-[color:var(--brand-deep)]" : "text-white"}`}
        />
      )}
    </button>
  );
}

/** Type, Colour and Size pickers, shared by the product page and the quick-add sheet. */
export function ProductOptions({
  product,
  value,
  onChange,
  idPrefix = "opt",
}: {
  product: Product;
  value: ProductSelection;
  onChange: (next: ProductSelection) => void;
  idPrefix?: string;
}) {
  const types = product.typeOption?.values ?? [];

  return (
    <div className="space-y-5">
      {types.length > 0 && (
        <fieldset className="space-y-2.5" aria-describedby={`${idPrefix}-type`}>
          <legend className="sr-only">{product.typeOption?.label || "Type"}</legend>
          <GroupHeading label={product.typeOption?.label || "Type"} value={value.type} />
          <div className="flex flex-wrap gap-2" id={`${idPrefix}-type`}>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={value.type === type}
                onClick={() => onChange({ ...value, type })}
                className={`${chipBase} ${value.type === type ? chipOn : chipOff}`}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.colors.length > 0 && (
        <fieldset className="space-y-2.5">
          <legend className="sr-only">Colour</legend>
          <GroupHeading label="Colour" value={value.color} />
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <ColorSwatch
                key={color.name}
                color={color}
                selected={value.color === color.name}
                onClick={() => onChange({ ...value, color: color.name })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {product.sizes.length > 0 && (
        <fieldset className="space-y-2.5">
          <legend className="sr-only">Size</legend>
          <GroupHeading label="Size" value={value.size} />
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={value.size === size}
                onClick={() => onChange({ ...value, size })}
                className={`${chipBase} ${value.size === size ? chipOn : chipOff}`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
