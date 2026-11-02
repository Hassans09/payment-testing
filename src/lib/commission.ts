import { PLATFORM_COMMISSION_PERCENT, PLATFORM_SELLER_ID } from "@/lib/config";
import type { OrderItem, SellerSplit } from "@/lib/types";

/**
 * Splits one order line between the seller and the platform.
 * The platform's own products carry no commission: the whole line is platform revenue.
 * Commission is rounded to the nearest Naira; the seller gets the rest.
 */
export function splitLine(unitPrice: number, quantity: number, sellerId: string) {
  const lineTotal = Math.round(unitPrice * quantity);
  const commissionPercent = sellerId === PLATFORM_SELLER_ID ? 0 : PLATFORM_COMMISSION_PERCENT;
  const commissionAmount = Math.round((lineTotal * commissionPercent) / 100);

  return {
    lineTotal,
    commissionPercent,
    commissionAmount,
    sellerAmount: lineTotal - commissionAmount,
  };
}

/** Groups order lines per seller. */
export function buildSellerSplits(items: OrderItem[]): SellerSplit[] {
  const map = new Map<string, SellerSplit>();

  for (const item of items) {
    const current = map.get(item.sellerId) ?? {
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      grossAmount: 0,
      commissionAmount: 0,
      sellerAmount: 0,
    };
    current.grossAmount += item.lineTotal;
    current.commissionAmount += item.commissionAmount;
    current.sellerAmount += item.sellerAmount;
    map.set(item.sellerId, current);
  }

  return [...map.values()];
}
