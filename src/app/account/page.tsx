"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice, products } from "@/lib/store-data";

const recentOrders = [
  {
    id: "RF-LAG-10842",
    date: "14 Oct 2026",
    status: "In Transit",
    courier: "GIG Logistics (GIG-9482104)",
    destination: "Lekki Phase 1, Lagos",
    items: "Archives Heavyweight Graphic T-Shirt + 1 item",
    total: 92500,
    steps: [
      { label: "Confirmed", done: true },
      { label: "Packaging", done: true },
      { label: "In Transit", current: true },
      { label: "Delivered", done: false },
    ],
  },
  {
    id: "RF-ABJ-09821",
    date: "28 Sep 2026",
    status: "Delivered",
    courier: "GIG Express Dispatch",
    destination: "Maitama, Abuja (FCT)",
    items: "Atelier Relaxed Unstructured Blazer",
    total: 95000,
    steps: [
      { label: "Confirmed", done: true },
      { label: "Packaging", done: true },
      { label: "In Transit", done: true },
      { label: "Delivered", done: true },
    ],
  },
];

const savedAddresses = [
  {
    type: "Default Shipping",
    name: "Maya Adeleke",
    phone: "+234 802 918 3491",
    address: "14B Admiralty Way, Lekki Phase 1",
    cityState: "Lekki, Lagos State",
  },
  {
    type: "Secondary / Office",
    name: "Maya Adeleke",
    phone: "+234 802 918 3491",
    address: "Plot 402, Gana Street, Maitama",
    cityState: "Abuja (FCT)",
  },
];

export default function AccountPage() {
  const { wishlist, addToCart } = useStore();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Account Hero Banner */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[color:var(--brand-border)] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Rebel Atelier Member
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Welcome back, Maya
          </h1>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">
            Lagos VIP Tier • Member since 2024 • Verified Phone (+234 802 918 3491)
          </p>
        </div>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50 transition shadow-2xs"
        >
          Sign Out
        </Link>
      </div>

      {/* Metric Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
            Saved in Wishlist
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">{wishlist.length}</p>
          <span className="mt-1 inline-block text-[11px] text-[color:var(--brand-primary)] font-medium">
            Ready to move to bag
          </span>
        </div>

        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
            Total Orders Placed
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">02</p>
          <span className="mt-1 inline-block text-[11px] text-emerald-700 font-medium">
            1 in transit via GIG Logistics
          </span>
        </div>

        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
            Saved Delivery Addresses
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">2</p>
          <span className="mt-1 inline-block text-[11px] text-[color:var(--brand-charcoal)]/70">
            Lekki & Maitama verified
          </span>
        </div>
      </div>

      {/* Main Grid: Orders & Addresses */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Real-time Order Tracking Pipeline */}
        <div className="space-y-6">
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:p-8 shadow-[0_16px_35px_rgba(91,64,50,0.03)] space-y-6">
            <div className="flex items-center justify-between border-b border-[color:var(--brand-border)]/60 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
                  Active Orders & Real-time Tracking
                </h2>
                <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                  Track Nigerian dispatch updates directly through GIG Logistics
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-primary)] hover:underline"
              >
                Shop New Drop
              </Link>
            </div>

            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 p-5 space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[color:var(--brand-deep)]">{order.id}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "In Transit"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                        {order.items} • Ordered {order.date}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-extrabold text-base text-[color:var(--brand-deep)]">
                        {formatPrice(order.total)}
                      </span>
                      <p className="text-[11px] text-[color:var(--brand-charcoal)]/60">{order.courier}</p>
                    </div>
                  </div>

                  {/* 4-Step Pipeline Visualizer */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[color:var(--brand-border)]/60 text-center">
                    {order.steps.map((st) => (
                      <div key={st.label} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            st.done
                              ? "bg-emerald-600"
                              : st.current
                                ? "bg-[color:var(--brand-primary)]"
                                : "bg-[color:var(--brand-border)]"
                          }`}
                        />
                        <span
                          className={`block text-[10px] font-semibold uppercase tracking-wider ${
                            st.done || st.current
                              ? "text-[color:var(--brand-deep)] font-bold"
                              : "text-[color:var(--brand-charcoal)]/40"
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 text-[color:var(--brand-charcoal)]/75">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
                      <span>Destination: {order.destination}</span>
                    </span>
                    <span className="font-medium text-[color:var(--brand-deep)] underline cursor-pointer">
                      View GIG Waybill
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Wishlist Pieces with 1-Click Move to Bag */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:p-8 shadow-[0_16px_35px_rgba(91,64,50,0.03)] space-y-5">
            <div className="flex items-center justify-between border-b border-[color:var(--brand-border)]/60 pb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600 fill-red-600" />
                <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
                  Saved Pieces ({wishlist.length})
                </h2>
              </div>
              <Link
                href="/wishlist"
                className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] hover:underline"
              >
                View Full Wishlist
              </Link>
            </div>

            {savedProducts.length === 0 ? (
              <p className="text-xs text-[color:var(--brand-charcoal)]/65 py-4">
                No saved items right now. Browse our store and tap the heart icon on any style!
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedProducts.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[color:var(--brand-ivory)]">
                        <Image src={item.images[0]} alt={item.name} fill sizes="50px" className="object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[color:var(--brand-deep)] line-clamp-1">{item.name}</p>
                        <p className="text-xs font-bold text-[color:var(--brand-primary)]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({ product: item, color: item.colors[0], size: item.sizes[0], quantity: 1 }, true)
                      }
                      className="shrink-0 rounded-full bg-[color:var(--brand-deep)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[color:var(--brand-chocolate)] transition"
                    >
                      Move to Bag
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile & Nigerian Addresses */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/35 p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)] space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Customer Profile</h2>
            <ul className="space-y-3 text-xs text-[color:var(--brand-charcoal)]/80">
              <li className="flex items-center justify-between border-b border-[color:var(--brand-border)]/50 pb-2">
                <span className="text-[color:var(--brand-charcoal)]/60">Full Name</span>
                <span className="font-bold text-[color:var(--brand-deep)]">Maya Adeleke</span>
              </li>
              <li className="flex items-center justify-between border-b border-[color:var(--brand-border)]/50 pb-2">
                <span className="text-[color:var(--brand-charcoal)]/60">Email</span>
                <span className="font-bold text-[color:var(--brand-deep)]">maya@rebelfashion.ng</span>
              </li>
              <li className="flex items-center justify-between border-b border-[color:var(--brand-border)]/50 pb-2">
                <span className="text-[color:var(--brand-charcoal)]/60">Phone (WhatsApp)</span>
                <span className="font-bold text-[color:var(--brand-deep)]">+234 802 918 3491</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[color:var(--brand-charcoal)]/60">Preferred Hub</span>
                <span className="font-bold text-[color:var(--brand-deep)]">Lekki Dispatch Centre</span>
              </li>
            </ul>
          </div>

          {/* Saved Addresses Book */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--brand-border)]/60 pb-3">
              <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Address Book</h2>
              <span className="text-xs font-semibold text-[color:var(--brand-primary)]">2 Verified</span>
            </div>

            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <div key={addr.type} className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
                      {addr.type}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-[color:var(--brand-deep)]">{addr.name}</p>
                  <p className="text-[color:var(--brand-charcoal)]/70">{addr.address}</p>
                  <p className="text-[color:var(--brand-charcoal)]/70">{addr.cityState}</p>
                  <p className="text-[color:var(--brand-charcoal)]/60">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
