
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/store-data";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory (FCT)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type PaymentMethod = "card" | "transfer" | "pod";
type ShippingMethod = "standard" | "priority";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useStore();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    shippingMethod: "standard" as ShippingMethod,
    paymentMethod: "card" as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const shippingCost =
    subtotal === 0 ? 0 : form.shippingMethod === "priority" ? 6500 : 3500;

  const finalTotal = Math.max(0, subtotal + shippingCost);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      nextErrors.phone = "Please enter a valid Nigerian phone number.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Please enter your delivery address.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "Please enter your city or LGA.";
    }

    if (!form.state) {
      nextErrors.state = "Please select your state.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (cart.length === 0) {
      setSubmitError("Your shopping bag is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * BACKEND INTEGRATION CONTRACT
       *
       * POST /api/checkout
       *
       * The backend must validate the cart and calculate the real total.
       *
       * Card / transfer response:
       * { "checkoutUrl": "https://..." }
       *
       * Pay on delivery response:
       * { "orderId": "a-real-order-reference" }
       *
       * The backend engineer can adjust this contract to match the
       * project's actual API and FairSurePay integration.
       */

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state,
          },
          items: cart,
          shippingMethod: form.shippingMethod,
          paymentMethod: form.paymentMethod,
          displayedSubtotal: subtotal,
          displayedShipping: shippingCost,
          displayedTotal: finalTotal,
        }),
      });

      const data: {
        error?: string;
        checkoutUrl?: string;
        orderId?: string;
        total?: number;
        subtotal?: number;
        shippingCost?: number;
      } = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "We couldn't process your request. Please try again."
        );
      }

      if (form.paymentMethod === "card" || form.paymentMethod === "transfer") {
        if (
          !data.checkoutUrl ||
          !/^https:\/\//i.test(data.checkoutUrl)
        ) {
          throw new Error(
            "The payment service has not returned a valid checkout link. No payment has been confirmed."
          );
        }

        // The backend supplies the hosted payment URL.
        window.location.assign(data.checkoutUrl);
        return;
      }

      if (!data.orderId) {
        throw new Error(
          "The server did not return an order reference. Please contact support before trying again."
        );
      }

      // Store confirmation details only after the backend accepts the order.
      const orderSnapshot = {
        orderId: data.orderId,
        customerName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: `${form.address.trim()}, ${form.city.trim()}, ${form.state}`,
        paymentMethod: "pod",
        total: data.total ?? finalTotal,
        subtotal: data.subtotal ?? subtotal,
        shippingCost: data.shippingCost ?? shippingCost,
        items: cart,
        date: new Date().toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      sessionStorage.setItem(
        "last_store_order",
        JSON.stringify(orderSnapshot)
      );

      clearCart();
      window.location.assign("/checkout/success");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-10 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-[color:var(--brand-primary)]" />
          <h1 className="mt-4 text-3xl font-bold text-[color:var(--brand-deep)]">
            Your shopping bag is empty
          </h1>
          <p className="mt-3 text-sm text-[color:var(--brand-charcoal)]/70">
            Add something you love before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[color:var(--brand-deep)] px-7 py-3 text-sm font-semibold text-white"
          >
            Browse collection
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)]";

  const sectionClass =
    "rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 sm:p-7";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-[color:var(--brand-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
            <ShieldCheck className="h-4 w-4" />
            Secure checkout
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">
            Complete your order
          </h1>
          <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">
            A few details, then choose how you want to pay.
          </p>
        </div>

        <Link
          href="/cart"
          className="hidden items-center gap-2 text-sm font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] sm:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Shopping bag
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {/* Delivery details */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-sm font-bold text-white">
                  1
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--brand-deep)]">
                    Delivery information
                  </h2>
                  <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                    Where should we send your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Full name *
                  </span>
                  <input
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                  {errors.fullName && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.fullName}
                    </span>
                  )}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Email address *
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Phone number *
                  </span>
                  <div className="mt-2 flex items-center rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] focus-within:border-[color:var(--brand-primary)]">
                    <span className="border-r border-[color:var(--brand-border)] px-3 py-3 text-sm font-semibold text-[color:var(--brand-deep)]">
                      +234
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="801 234 5678"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Street address / house number *
                  </span>
                  <input
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="House number, street and area"
                    className={inputClass}
                  />
                  {errors.address && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.address}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    City / LGA *
                  </span>
                  <input
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Your city or LGA"
                    className={inputClass}
                  />
                  {errors.city && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.city}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    State / FCT *
                  </span>
                  <select
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state === "Federal Capital Territory (FCT)"
                          ? "Abuja (FCT)"
                          : state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.state}
                    </span>
                  )}
                </label>
              </div>
            </section>

            {/* Shipping */}
            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-sm font-bold text-white">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--brand-deep)]">
                    Shipping & dispatch
                  </h2>
                  <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                    Choose your preferred delivery option.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={form.shippingMethod === "standard"}
                  onClick={() => updateField("shippingMethod", "standard")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    form.shippingMethod === "standard"
                      ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                      : "border-[color:var(--brand-border)] hover:border-[color:var(--brand-primary)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Truck className="h-5 w-5 text-[color:var(--brand-primary)]" />
                    {form.shippingMethod === "standard" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                    Standard dispatch
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/70">
                    2–4 business days
                  </p>
                  <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(3500)}
                  </p>
                </button>

                <button
                  type="button"
                  aria-pressed={form.shippingMethod === "priority"}
                  onClick={() => updateField("shippingMethod", "priority")}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    form.shippingMethod === "priority"
                      ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                      : "border-[color:var(--brand-border)] hover:border-[color:var(--brand-primary)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Truck className="h-5 w-5 text-[color:var(--brand-primary)]" />
                    {form.shippingMethod === "priority" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                    Priority dispatch
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/70">
                    Faster processing
                  </p>
                  <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                    {formatPrice(6500)}
                  </p>
                </button>
              </div>
            </section>

            {/* Payment method */}
            <section className={sectionClass}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-deep)] text-sm font-bold text-white">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--brand-deep)]">
                    Payment method
                  </h2>
                  <p className="text-xs text-[color:var(--brand-charcoal)]/65">
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "card" as const,
                    title: "Pay with Card",
                    description:
                      "Continue to the secure payment provider to pay by card.",
                    Icon: CreditCard,
                  },
                  {
                    id: "transfer" as const,
                    title: "Bank Transfer",
                    description:
                      "Continue to the payment provider for supported transfer instructions.",
                    Icon: Landmark,
                  },
                  {
                    id: "pod" as const,
                    title: "Pay on Delivery",
                    description:
                      "Submit your order and pay when it is delivered.",
                    Icon: PackageCheck,
                  },
                ].map(({ id, title, description, Icon }) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={form.paymentMethod === id}
                    onClick={() => updateField("paymentMethod", id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      form.paymentMethod === id
                        ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                        : "border-[color:var(--brand-border)] hover:border-[color:var(--brand-primary)]"
                    }`}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--brand-primary)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-[color:var(--brand-deep)]">
                        {title}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[color:var(--brand-charcoal)]/70">
                        {description}
                      </span>
                    </span>
                    <span
                      className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                        form.paymentMethod === id
                          ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] ring-2 ring-[color:var(--brand-deep)] ring-offset-2"
                          : "border-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {form.paymentMethod !== "pod" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-[color:var(--brand-cream)] p-4">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--brand-primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
                      Secure payment provider
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[color:var(--brand-charcoal)]/70">
                      Payment will continue through a hosted checkout supplied
                      by the backend. Rebel Fashion does not collect your card
                      details on this page.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Order summary */}
          <aside className={`${sectionClass} lg:sticky lg:top-6`}>
            <h2 className="text-xl font-bold text-[color:var(--brand-deep)]">
              Order summary
            </h2>
            <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/65">
              {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
            </p>

            <div className="mt-5 max-h-72 space-y-4 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-[color:var(--brand-border)] pb-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">
                      {item.color ? `${item.color} · ` : ""}
                      {item.size ? `${item.size} · ` : ""}
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[color:var(--brand-deep)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--brand-charcoal)]/70">
                  Subtotal
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[color:var(--brand-charcoal)]/70">
                  {form.shippingMethod === "priority"
                    ? "Priority dispatch"
                    : "Standard dispatch"}
                </span>
                <span className="font-medium">
                  {formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t border-[color:var(--brand-border)] pt-4 text-base">
                <span className="font-bold text-[color:var(--brand-deep)]">
                  Total due
                </span>
                <span className="font-extrabold text-[color:var(--brand-deep)]">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                "Please wait..."
              ) : form.paymentMethod === "card" ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay with Card
                </>
              ) : form.paymentMethod === "transfer" ? (
                <>
                  <Landmark className="h-4 w-4" />
                  Continue to Bank Transfer
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  Place Order — Pay on Delivery
                </>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[color:var(--brand-charcoal)]/65">
              <LockKeyhole className="h-3.5 w-3.5" />
              Your information is used to process your order.
            </p>

            <p className="mt-4 text-center text-xs leading-5 text-[color:var(--brand-charcoal)]/60">
              Payment and order confirmation require a successful response from
              the backend.
            </p>
          </aside>
        </div>
      </form>
    </main>
  );
}
