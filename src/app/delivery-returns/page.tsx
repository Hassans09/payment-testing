import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { DELIVERY_ESTIMATES, RETURN_WINDOW_DAYS, SHIPPING_RATES, SITE_NAME } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description: `Delivery fees, timings and the returns policy at ${SITE_NAME}.`,
};

export default function DeliveryReturnsPage() {
  return (
    <InfoPage eyebrow="Help" title="Delivery & returns" intro={`We deliver across Nigeria. Every order on ${SITE_NAME} is covered by the same delivery and returns rules, whoever sells it.`}>
      <section>
        <h2>Delivery fees</h2>
        <ul>
          <li>Standard dispatch: {formatPrice(SHIPPING_RATES.standard)} ({DELIVERY_ESTIMATES.standard})</li>
          <li>Priority dispatch: {formatPrice(SHIPPING_RATES.priority)} ({DELIVERY_ESTIMATES.priority.toLowerCase()})</li>
        </ul>
        <p className="mt-2">One delivery fee per order, shown before you pay. Remote areas can take a little longer.</p>
      </section>
      <section>
        <h2>Orders with several sellers</h2>
        <p>Items from different sellers may arrive in separate packages. Track each part on the order tracking page.</p>
      </section>
      <section>
        <h2>Returns</h2>
        <ul>
          <li>Return unworn items with their tags within {RETURN_WINDOW_DAYS} days of delivery.</li>
          <li>Wrong, damaged or not-as-described items: we cover the return delivery.</li>
          <li>Custom-made or altered pieces, underwear and earrings can&apos;t be returned unless faulty.</li>
          <li>Refunds go back to your original payment method once the item is checked.</li>
        </ul>
        <p className="mt-2">To start a return, contact us with your order reference from the Help page.</p>
      </section>
    </InfoPage>
  );
}
