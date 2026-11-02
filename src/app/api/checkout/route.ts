import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_SELLER_ID, SHIPPING_RATES, SITE_NAME } from "@/lib/config";
import { splitLine } from "@/lib/commission";
import { findSeedProduct } from "@/lib/seed-data";

/**
 * MOCK checkout-init route (only active when MOCK_PAYMENTS=true). Used by src/lib/api/mock.ts.
 *
 * Validates the bag, re-checks prices, works out the seller/platform split and returns the
 * same shape as the real backend's POST /orders:
 *   { orderId, ref, amount, currency: "NGN", publicKey, narration, ...breakdown }
 * The browser then opens the Fairsure inline checkout with `publicKey` (sandbox when it is a
 * TEST_ key) or, when no public key is configured, completes a demo payment.
 * In production the backend's own route (see BACKEND.md, "Payments with Fairsure") replaces this.
 * It never touches FAIRSURE_PRIVATE_KEY.
 */

function generateOrderReference(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RF-${yy}${mm}${dd}-${randomStr}`;
}

export async function POST(request: NextRequest) {
  if (process.env.MOCK_PAYMENTS !== "true") {
    return NextResponse.json(
      { error: "Mock payments are disabled." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { customer, items, shippingMethod, paymentMethod, displayedTotal } =
    (body && typeof body === "object" ? body : {}) as {
      customer?: {
        fullName?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
      };
      items?: Array<{
        id?: string;
        productId?: string;
        quantity?: number;
        unitPrice?: number;
        price?: number;
        sellerId?: string;
      }>;
      shippingMethod?: string;
      paymentMethod?: string;
      displayedTotal?: number;
    };

  if (
    !customer ||
    typeof customer.fullName !== "string" || !customer.fullName.trim() ||
    typeof customer.email !== "string" || !customer.email.trim() ||
    typeof customer.phone !== "string" || !customer.phone.trim() ||
    typeof customer.address !== "string" || !customer.address.trim() ||
    typeof customer.city !== "string" || !customer.city.trim() ||
    typeof customer.state !== "string" || !customer.state.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required customer details." },
      { status: 400 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Shopping bag items must not be empty." },
      { status: 400 }
    );
  }

  if (paymentMethod !== "card" && paymentMethod !== "transfer") {
    return NextResponse.json(
      { error: "Payment method must be 'card' or 'transfer'." },
      { status: 400 }
    );
  }

  let serverSubtotal = 0;
  let commissionTotal = 0;
  const sellerTotals: Record<string, { grossAmount: number; commissionAmount: number; sellerAmount: number }> = {};

  for (const item of items) {
    const productId = item.productId || item.id || "";
    const quantity = typeof item.quantity === "number" && item.quantity > 0 ? Math.min(Math.round(item.quantity), 99) : 1;
    const seedProduct = findSeedProduct(productId);

    let unitPrice: number;
    let sellerId: string;

    if (seedProduct) {
      // Platform catalogue: the server knows the real price.
      unitPrice = seedProduct.price;
      sellerId = seedProduct.sellerId;
    } else {
      // Listings created by sellers in mock mode only exist in the shopper's browser,
      // so the mock has to trust the submitted price. The real backend must ALWAYS
      // look the price up in its own database.
      const submitted = typeof item.unitPrice === "number" ? item.unitPrice : item.price;
      if (typeof submitted !== "number" || !Number.isFinite(submitted) || submitted <= 0 || !item.sellerId || item.sellerId === PLATFORM_SELLER_ID) {
        return NextResponse.json(
          { error: "One or more items in your bag are invalid." },
          { status: 400 }
        );
      }
      unitPrice = Math.round(submitted);
      sellerId = item.sellerId;
    }

    const split = splitLine(unitPrice, quantity, sellerId);
    serverSubtotal += split.lineTotal;
    commissionTotal += split.commissionAmount;
    const totals = (sellerTotals[sellerId] ??= { grossAmount: 0, commissionAmount: 0, sellerAmount: 0 });
    totals.grossAmount += split.lineTotal;
    totals.commissionAmount += split.commissionAmount;
    totals.sellerAmount += split.sellerAmount;
  }

  const shippingCost = shippingMethod === "priority" ? SHIPPING_RATES.priority : SHIPPING_RATES.standard;
  const serverTotal = serverSubtotal + shippingCost;

  if (serverTotal !== displayedTotal) {
    return NextResponse.json(
      { error: "Prices have changed. Please review your bag." },
      { status: 409 }
    );
  }

  const orderRef = generateOrderReference();
  const publicKey = (process.env.NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY ?? "").trim();

  return NextResponse.json(
    {
      orderId: `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      ref: orderRef,
      amount: serverTotal,
      currency: "NGN",
      // Only a PUBLIC key (TEST_/LIVE_) is ever returned. null -> the frontend runs the demo payment.
      publicKey: /^(TEST|LIVE)_/.test(publicKey) ? publicKey : null,
      narration: `${SITE_NAME} order ${orderRef}`,
      subtotal: serverSubtotal,
      shippingCost,
      total: serverTotal,
      commissionTotal,
      sellerSplits: Object.entries(sellerTotals).map(([sellerId, totals]) => ({ sellerId, ...totals })),
    },
    { status: 200 }
  );
}
