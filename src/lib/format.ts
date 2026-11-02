import { categoryName } from "@/lib/config";
export function formatPrice(value: number): string {
  return (
    "₦" +
    new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
    }).format(value)
  );
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function maskAccountNumber(value: string): string {
  if (value.length <= 4) return value;
  return "•".repeat(Math.max(0, value.length - 4)) + value.slice(-4);
}

/** "Long · White · M" — the options a shopper chose for a bag/order line. */
export function formatLineOptions(line: { type?: string; color?: string; size?: string }): string {
  return [line.type, line.color, line.size].filter((value) => value && value.trim()).join(" · ");
}

/** Short generic label for a product: the seller's optional type detail, else its category name. */
export function productLabel(product: { category: string; productType?: string }): string {
  return product.productType?.trim() || categoryName(product.category);
}
