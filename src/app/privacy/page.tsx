import type { Metadata } from "next";

import { InfoPage } from "@/components/info-page";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy policy", description: `How ${SITE_NAME} uses your information.` };

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy policy" intro="Draft: have it reviewed (NDPA 2023) before launch.">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Order details: your name, email, phone and delivery address.</li>
          <li>Sellers: business details and the bank account used for payouts.</li>
          <li>Card and bank details are entered in Fairsure&apos;s secure window; {SITE_NAME} never sees or stores them.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To deliver your order, send updates and handle returns.</li>
          <li>Sellers only receive what they need to ship their items (your name and delivery area/address).</li>
          <li>We don&apos;t sell your data. You can ask us to see or delete it through the Help page.</li>
        </ul>
      </section>
      <section>
        <h2>On this device</h2>
        <p>Your bag and saved items are kept in your browser so they&apos;re there when you come back.</p>
      </section>
    </InfoPage>
  );
}
