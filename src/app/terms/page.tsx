import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { PLATFORM_COMMISSION_PERCENT, RETURN_WINDOW_DAYS, SITE_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Terms & conditions", description: `Terms for shopping and selling on ${SITE_NAME}.` };

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Legal" title="Terms & conditions" intro={`These terms cover shopping and selling on ${SITE_NAME}. Draft: have them reviewed before launch.`}>
      <section>
        <h2>Shopping</h2>
        <ul>
          <li>Prices are in Naira and include the item; the delivery fee is shown at checkout.</li>
          <li>An order is confirmed once the payment is verified. If an item can&apos;t be supplied, you get a full refund.</li>
          <li>Returns follow the Delivery &amp; returns policy ({RETURN_WINDOW_DAYS} days for unworn items).</li>
          <li>Marketplace items are sold by independent sellers; {SITE_NAME} handles payment and support for every order.</li>
        </ul>
      </section>
      <section id="sellers" className="scroll-mt-24">
        <h2>Seller terms</h2>
        <ul>
          <li>New stores and every listing are reviewed before they appear in the shop. We can reject, pause or remove listings and suspend stores that break these terms.</li>
          <li>{SITE_NAME} keeps {PLATFORM_COMMISSION_PERCENT}% of each item sold; you receive {100 - PLATFORM_COMMISSION_PERCENT}% to the bank account you provide, after the order is paid and fulfilled.</li>
          <li>Only list items you own or are allowed to sell. No counterfeit, stolen or prohibited goods, and photos and descriptions must be accurate.</li>
          <li>Keep stock up to date and ship paid orders promptly; mark them shipped and delivered in your dashboard.</li>
          <li>Customer returns and refunds follow the store&apos;s Delivery &amp; returns policy.</li>
        </ul>
      </section>
    </InfoPage>
  );
}
