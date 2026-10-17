"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice, products } from "@/lib/store-data";

type OrderStatusStep = { label: string; done?: boolean; current?: boolean };
type AccountOrder = {
  id: string;
  date: string;
  status: string;
  destination: string;
  items: string;
  total: number;
  steps: OrderStatusStep[];
};

type AccountAddress = {
  type: string;
  name: string;
  phone: string;
  address: string;
  cityState: string;
};

const recentOrders: AccountOrder[] = [
  {
    id: "ORD-20481",
    date: "14 Oct 2026",
    status: "Preparing",
    destination: "Central City",
    items: "Signature Plain Heavyweight Tee + 1 item",
    total: 92500,
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", current: true },
      { label: "Shipped", done: false },
      { label: "Delivered", done: false },
    ],
  },
  {
    id: "ORD-20112",
    date: "28 Sep 2026",
    status: "Delivered",
    destination: "North District",
    items: "Atelier Relaxed Unstructured Blazer",
    total: 95000,
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: true },
      { label: "Shipped", done: true },
      { label: "Delivered", done: true },
    ],
  },
];

const savedAddresses: AccountAddress[] = [
  {
    type: "Default Address",
    name: "Alex Customer",
    phone: "+1 555 0102",
    address: "120 Market Street",
    cityState: "Central City",
  },
  {
    type: "Work Address",
    name: "Alex Customer",
    phone: "+1 555 0102",
    address: "49 Commerce Avenue",
    cityState: "North District",
  },
];

export default function AccountPage() {
  const { wishlist, addToCart } = useStore();
  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-[color:var(--brand-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Account Dashboard</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">Welcome back</h1>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">Manage orders, addresses, and saved products.</p>
        </div>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)] shadow-2xs transition hover:bg-[color:var(--brand-soft)]/50"
        >
          Sign Out
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Saved in Wishlist</p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">{wishlist.length}</p>
        </div>

        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Orders</p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">{recentOrders.length.toString().padStart(2, "0")}</p>
        </div>

        <div className="rounded-[28px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_12px_30px_rgba(91,64,50,0.03)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">Saved Addresses</p>
          <p className="mt-2 text-3xl font-extrabold text-[color:var(--brand-deep)]">{savedAddresses.length}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="space-y-6 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)] sm:p-8">
            <div className="border-b border-[color:var(--brand-border)]/60 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Recent Orders</h2>
              <p className="text-xs text-[color:var(--brand-charcoal)]/65">Order statuses are placeholder frontend data ready for backend responses.</p>
            </div>

            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="space-y-4 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[color:var(--brand-deep)]">{order.id}</span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">{order.items} • Ordered {order.date}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-[color:var(--brand-deep)]">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 border-t border-[color:var(--brand-border)]/60 pt-2 text-center">
                    {order.steps.map((step) => (
                      <div key={step.label} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            step.done ? "bg-emerald-600" : step.current ? "bg-[color:var(--brand-primary)]" : "bg-[color:var(--brand-border)]"
                          }`}
                        />
                        <span
                          className={`block text-[10px] font-semibold uppercase tracking-wider ${
                            step.done || step.current ? "text-[color:var(--brand-deep)]" : "text-[color:var(--brand-charcoal)]/40"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-[color:var(--brand-charcoal)]/75">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[color:var(--brand-primary)]" />
                      <span>Destination: {order.destination}</span>
                    </span>
                    <span className="font-medium text-[color:var(--brand-deep)] underline">View details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)] sm:p-8">
            <div className="flex items-center justify-between border-b border-[color:var(--brand-border)]/60 pb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Saved Products ({wishlist.length})</h2>
              </div>
              <Link href="/wishlist" className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] hover:underline">
                View Wishlist
              </Link>
            </div>

            {savedProducts.length === 0 ? (
              <p className="py-4 text-xs text-[color:var(--brand-charcoal)]/65">No saved products yet. Tap the heart icon on any product to add it here.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedProducts.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[color:var(--brand-ivory)]">
                        <Image src={item.images[0]} alt={item.name} fill sizes="50px" className="object-cover" />
                      </div>
                      <div>
                        <p className="line-clamp-1 text-xs font-bold text-[color:var(--brand-deep)]">{item.name}</p>
                        <p className="text-xs font-bold text-[color:var(--brand-primary)]">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart({ product: item, color: item.colors[0], size: item.sizes[0], quantity: 1 }, true)}
                      className="shrink-0 rounded-full bg-[color:var(--brand-deep)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]"
                    >
                      Add to Bag
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/35 p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)]">
            <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Customer Profile</h2>
            <ul className="space-y-3 text-xs text-[color:var(--brand-charcoal)]/80">
              <li className="flex items-center justify-between border-b border-[color:var(--brand-border)]/50 pb-2">
                <span className="text-[color:var(--brand-charcoal)]/60">Full Name</span>
                <span className="font-bold text-[color:var(--brand-deep)]">Alex Customer</span>
              </li>
              <li className="flex items-center justify-between border-b border-[color:var(--brand-border)]/50 pb-2">
                <span className="text-[color:var(--brand-charcoal)]/60">Email</span>
                <span className="font-bold text-[color:var(--brand-deep)]">customer@example.com</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[color:var(--brand-charcoal)]/60">Phone</span>
                <span className="font-bold text-[color:var(--brand-deep)]">+1 555 0102</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.03)]">
            <div className="flex items-center justify-between border-b border-[color:var(--brand-border)]/60 pb-3">
              <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">Address Book</h2>
              <span className="text-xs font-semibold text-[color:var(--brand-primary)]">{savedAddresses.length} saved</span>
            </div>

            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <div key={address.type} className="space-y-1.5 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">{address.type}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">Active</span>
                  </div>
                  <p className="text-sm font-semibold text-[color:var(--brand-deep)]">{address.name}</p>
                  <p className="text-[color:var(--brand-charcoal)]/70">{address.address}</p>
                  <p className="text-[color:var(--brand-charcoal)]/70">{address.cityState}</p>
                  <p className="text-[color:var(--brand-charcoal)]/60">{address.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
