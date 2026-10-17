"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/store-data";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Edo",
  "Kaduna",
  "Anambra",
  "Kwara",
  "Akwa Ibom",
  "Plateau",
  "Ondo",
  "Imo",
  "Abia",
  "Cross River",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useStore();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
    deliveryNotes: "",
    shippingMethod: "standard", // standard | priority
    paymentMethod: "paystack", // paystack | transfer | pod
  });

  const [copiedBank, setCopiedBank] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    if (form.shippingMethod === "priority") return 6500;
    return 3500;
  }, [subtotal, form.shippingMethod]);

  const finalTotal = Math.max(0, subtotal + shippingCost);

  const copyAccountNumber = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("0249827182");
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.address.trim()) nextErrors.address = "Delivery street address is required.";
    if (!form.city.trim()) nextErrors.city = "City / District is required.";

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailValid) {
      nextErrors.email = "Please provide a valid email.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      // Save order metadata to sessionStorage for confirmation screen
      if (typeof window !== "undefined") {
        try {
          const orderSnapshot = {
            orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
            customerName: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
            address: `${form.address}, ${form.city}, ${form.state}`,
            paymentMethod: form.paymentMethod,
            total: finalTotal,
            subtotal,
            shippingCost,
            items: cart,
            date: new Date().toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          };
          sessionStorage.setItem("last_store_order", JSON.stringify(orderSnapshot));
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        clearCart();
        router.push("/checkout/success");
      }, 700);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-12 text-center shadow-[0_16px_40px_rgba(91,64,50,0.04)]">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            Express Checkout
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Your shopping bag is empty
          </h1>
          <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/70 max-w-sm mx-auto">
            Add items to your bag before starting checkout.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 flex items-center justify-between border-b border-[color:var(--brand-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)]">
            Complete Your Order
          </h1>
        </div>
        <Link
          href="/cart"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to bag</span>
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Form Container */}
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Section 1: Customer & Delivery Details */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:p-8 shadow-[0_12px_35px_rgba(91,64,50,0.03)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[color:var(--brand-border)]/60 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-xs font-bold text-white">
                1
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
                Delivery & Contact Information
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  First Name *
                </span>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]"
                />
                {errors.firstName && <span className="mt-1 block text-xs text-red-600">{errors.firstName}</span>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  Last Name *
                </span>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="e.g. Taylor"
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]"
                />
                {errors.lastName && <span className="mt-1 block text-xs text-red-600">{errors.lastName}</span>}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  Email Address (for Receipt & Tracking) *
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]"
                />
                {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)] flex items-center justify-between">
                  <span>Phone Number *</span>
                  <span className="text-[10px] text-emerald-800 font-normal">Order updates enabled</span>
                </span>
                <div className="flex items-center rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3 focus-within:border-[color:var(--brand-primary)]">
                  <span className="text-xs font-bold text-[color:var(--brand-deep)] pr-2 border-r border-[color:var(--brand-border)]">
                    +234
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="801 234 5678"
                    className="w-full bg-transparent px-3 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none"
                  />
                </div>
                {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  Street Address & House / Flat No. *
                </span>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 120 Market Street"
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]"
                />
                {errors.address && <span className="mt-1 block text-xs text-red-600">{errors.address}</span>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  City / Area *
                </span>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Central City"
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]"
                />
                {errors.city && <span className="mt-1 block text-xs text-red-600">{errors.city}</span>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]">
                  State in Nigeria *
                </span>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)] cursor-pointer"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Section 2: Dispatch Method */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:p-8 shadow-[0_12px_35px_rgba(91,64,50,0.03)] space-y-4">
            <div className="flex items-center gap-3 border-b border-[color:var(--brand-border)]/60 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-xs font-bold text-white">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
                  Shipping & Dispatch
                </h2>
                <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                  Select your preferred shipping speed.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, shippingMethod: "standard" })}
                className={`p-4 rounded-2xl text-left border-2 transition ${
                  form.shippingMethod === "standard"
                    ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                    : "border-[color:var(--brand-border)] bg-white hover:border-[color:var(--brand-primary)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[color:var(--brand-deep)]">Standard Dispatch</span>
                  <span className="font-bold text-sm text-[color:var(--brand-deep)]">{formatPrice(3500)}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                  2–4 business days.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, shippingMethod: "priority" })}
                className={`p-4 rounded-2xl text-left border-2 transition ${
                  form.shippingMethod === "priority"
                    ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                    : "border-[color:var(--brand-border)] bg-white hover:border-[color:var(--brand-primary)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[color:var(--brand-deep)]">Priority Dispatch</span>
                  <span className="font-bold text-sm text-[color:var(--brand-deep)]">{formatPrice(6500)}</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                  Faster processing and shipping priority.
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Payment Method Tabs */}
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 sm:p-8 shadow-[0_12px_35px_rgba(91,64,50,0.03)] space-y-6">
            <div className="flex items-center gap-3 border-b border-[color:var(--brand-border)]/60 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-xs font-bold text-white">
                3
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
                Payment Method
              </h2>
            </div>

            {/* Tabs */}
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: "paystack", label: "Card & Wallet", icon: CreditCard },
                { id: "transfer", label: "Direct Bank Transfer", icon: ShieldCheck },
                { id: "pod", label: "Pay on Delivery", icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = form.paymentMethod === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: tab.id })}
                    className={`flex items-center justify-center gap-2 rounded-2xl p-3.5 text-xs font-bold transition border-2 ${
                      isSelected
                        ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] text-white shadow-xs"
                        : "border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-[color:var(--brand-charcoal)] hover:bg-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Paystack */}
            {form.paymentMethod === "paystack" && (
              <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
                    Instant Gateway
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>
                <p className="text-xs text-[color:var(--brand-charcoal)]/80 leading-relaxed">
                  Accepts major cards and supported wallet/transfer options with instant confirmation.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-[color:var(--brand-charcoal)]/70">
                  <span className="font-semibold text-[color:var(--brand-deep)]">Supported:</span>
                  <span className="rounded-md bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Mastercard</span>
                  <span className="rounded-md bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Visa</span>
                  <span className="rounded-md bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Verve</span>
                  <span className="rounded-md bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">USSD</span>
                </div>
              </div>
            )}

            {/* Tab 2: Bank Transfer */}
            {form.paymentMethod === "transfer" && (
              <div className="rounded-2xl border border-[color:var(--brand-primary)]/50 bg-[linear-gradient(135deg,_rgba(196,154,120,0.1),_rgba(253,249,244,1))] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">
                    Official Transfer Account
                  </span>
                  <span className="text-[10px] font-semibold rounded-full bg-[color:var(--brand-primary)]/20 px-2.5 py-0.5 text-[color:var(--brand-deep)]">
                    Instant Reconciliation
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-[color:var(--brand-border)] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[color:var(--brand-charcoal)]/70">Bank Name:</span>
                    <span className="text-sm font-bold text-[color:var(--brand-deep)]">Wema Bank</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[color:var(--brand-charcoal)]/70">Account Name:</span>
                    <span className="text-sm font-bold text-[color:var(--brand-deep)]">
                      STORE OPERATIONS LTD
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[color:var(--brand-border)]/50">
                    <span className="text-xs text-[color:var(--brand-charcoal)]/70">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold tracking-wider text-[color:var(--brand-deep)]">
                        0249827182
                      </span>
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-cream)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand-deep)] border border-[color:var(--brand-border)] hover:bg-[color:var(--brand-soft)]/50 transition"
                      >
                        {copiedBank ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedBank ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[color:var(--brand-charcoal)]/75">
                  Send your transfer reference through support to complete verification.
                </p>
              </div>
            )}

            {/* Tab 3: Pay on Delivery */}
            {form.paymentMethod === "pod" && (
              <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/70 p-5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[color:var(--brand-deep)]">
                  <MapPin className="h-4 w-4 text-[color:var(--brand-primary)]" />
                  <span>Available in select areas</span>
                </div>
                <p className="text-xs text-[color:var(--brand-charcoal)]/80 leading-relaxed">
                  You can pay via card or transfer when the order arrives. Availability depends on destination.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] py-4 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition active:scale-[0.99] disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>
              {isSubmitting ? "Generating Order..." : `Review & Confirm Order • ${formatPrice(finalTotal)}`}
            </span>
          </button>
        </form>

        {/* Order Summary Column */}
        <aside className="space-y-6">
          <div className="rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-6 shadow-[0_16px_35px_rgba(91,64,50,0.04)] space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-[color:var(--brand-deep)]">
              Order Breakdown ({cart.reduce((t, i) => t + i.quantity, 0)})
            </h2>

            {/* Item List */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[color:var(--brand-cream)] p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-[color:var(--brand-ivory)] border border-[color:var(--brand-border)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[color:var(--brand-deep)] line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[color:var(--brand-charcoal)]/65">
                        {item.color} • {item.size} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 border-t border-[color:var(--brand-border)] pt-4 text-xs text-[color:var(--brand-charcoal)]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[color:var(--brand-deep)]">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[color:var(--brand-deep)]">{formatPrice(shippingCost)}</span>
              </div>

              <div className="flex justify-between border-t border-[color:var(--brand-border)] pt-3 text-base font-extrabold text-[color:var(--brand-deep)]">
                <span>Total Due</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[color:var(--brand-soft)]/30 p-3.5 text-[11px] text-[color:var(--brand-charcoal)]/75 space-y-1">
              <p className="font-semibold text-[color:var(--brand-deep)]">Frontend-ready checkout flow</p>
              <p>Shipping, payment, and order fields are structured for backend integration.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
