
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPin,
  Navigation,
  PackageCheck,
  ShieldCheck,
  Truck,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/store-data";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "Federal Capital Territory (FCT)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

type PaymentMethod = "card" | "transfer";
type ShippingMethod = "standard" | "priority";
type Coordinates = { latitude: number; longitude: number };

function matchNigerianState(value?: string): string {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  if (
    normalized.includes("abuja") ||
    normalized.includes("federal capital territory") ||
    normalized === "fct"
  ) {
    return "Federal Capital Territory (FCT)";
  }

  return (
    NIGERIAN_STATES.find(
      (state) => state.toLowerCase() === normalized
    ) ?? ""
  );
}

export default function CheckoutPage() {
  const { cart, subtotal } = useStore();

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
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationMessageType, setLocationMessageType] =
    useState<"success" | "error" | "info">("info");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const shippingCost =
    subtotal === 0 ? 0 : form.shippingMethod === "priority" ? 6500 : 3500;

  const finalTotal = Math.max(0, subtotal + shippingCost);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  }

  function scrollToFirstError(fieldName: string) {
    window.requestAnimationFrame(() => {
      const field = document.getElementById(fieldName);

      if (field) {
        field.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        field.focus({ preventScroll: true });
      }
    });
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(
          new Error(
            "Location is not supported by this browser. Please enter your address manually."
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new Error(
                  "Location permission was denied. Allow location access in your browser settings or enter your address manually."
                )
              );
              break;

            case error.POSITION_UNAVAILABLE:
              reject(
                new Error(
                  "Your phone could not determine its location. Turn on Location and try again."
                )
              );
              break;

            case error.TIMEOUT:
              reject(
                new Error(
                  "Finding your location took too long. Please try again or enter your address manually."
                )
              );
              break;

            default:
              reject(
                new Error(
                  "We couldn't get your location. Please enter your address manually."
                )
              );
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 60000,
          maximumAge: 120000,
        }
      );
    });
  }

  async function useMyLocation() {
    setIsLocating(true);
    setLocationMessage("");
    setSubmitError("");

    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCoordinates({ latitude, longitude });
      setLocationMessageType("info");
      setLocationMessage(
        "Location found. Looking up a readable address…"
      );

      const query = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "18",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${query.toString()}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error(
          "GPS location found, but the address lookup failed. Please enter or correct your address below."
        );
      }

      const result = await response.json();
      const parts = result?.address ?? {};

      const streetParts = [
        parts.house_number,
        parts.road || parts.pedestrian || parts.residential,
      ].filter(Boolean);

      const area =
        parts.suburb ||
        parts.neighbourhood ||
        parts.quarter ||
        parts.city_district ||
        "";

      const addressValue = [
        streetParts.join(" "),
        area && area !== parts.city ? area : "",
      ]
        .filter(Boolean)
        .join(", ");

      const cityValue =
        parts.city ||
        parts.town ||
        parts.village ||
        parts.municipality ||
        parts.county ||
        parts.state_district ||
        "";

      const stateValue = matchNigerianState(parts.state);

      setForm((current) => ({
        ...current,
        address: addressValue || current.address,
        city: cityValue || current.city,
        state: stateValue || current.state,
      }));

      setErrors((current) => ({
        ...current,
        address: "",
        city: "",
        state: "",
      }));

      setLocationMessageType("success");
      setLocationMessage(
        addressValue || cityValue
          ? "Location added. Please review and edit the address details before continuing."
          : "GPS location found, but no readable address was returned. Please enter your address manually."
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't retrieve your location. You can enter your address manually.";

      setLocationMessageType("error");
      setLocationMessage(message);
    } finally {
      setIsLocating(false);
    }
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

    const firstInvalidField = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
    ].find((field) => nextErrors[field]);

    if (firstInvalidField) {
      scrollToFirstError(firstInvalidField);
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Your shopping bag is empty.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
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
          deliveryLocation: coordinates,
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
      } = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "We couldn't process your request. Please try again."
        );
      }

      if (
        !data.checkoutUrl ||
        !/^https:\/\//i.test(data.checkoutUrl)
      ) {
        throw new Error(
          "The payment service has not returned a valid checkout link. No payment has been confirmed."
        );
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-3 text-sm text-[color:var(--brand-charcoal)] outline-none transition focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/20";

  const sectionClass =
    "rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-5 sm:p-7";

  function renderError(field: string) {
    if (!errors[field]) return null;

    return (
      <span
        id={`${field}-error`}
        role="alert"
        className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-600"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {errors[field]}
      </span>
    );
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
            Enter your delivery details, then choose how you want to pay.
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

      {submitError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
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

              <div className="mb-6 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-white)] text-[color:var(--brand-primary)]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[color:var(--brand-deep)]">
                      Use your current location
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[color:var(--brand-charcoal)]/70">
                      Let your browser find your location and fill in any address details it can identify. You can edit everything below.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={isLocating}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLocating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Finding your location…
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Use My Location
                    </>
                  )}
                </button>

                {locationMessage && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`mt-3 flex items-start gap-2 text-xs leading-5 ${
                      locationMessageType === "error"
                        ? "text-red-700"
                        : locationMessageType === "success"
                          ? "text-green-700"
                          : "text-[color:var(--brand-charcoal)]/75"
                    }`}
                  >
                    {locationMessageType === "error" ? (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{locationMessage}</span>
                  </p>
                )}

                <p className="mt-3 text-xs leading-5 text-[color:var(--brand-charcoal)]/60">
                  Your browser will ask permission before sharing your location. If you prefer, skip this and enter your delivery address manually.
                </p>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[color:var(--brand-border)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/55">
                  Delivery address · editable
                </span>
                <div className="h-px flex-1 bg-[color:var(--brand-border)]" />
              </div>

              {coordinates && (
                <p className="mb-4 rounded-xl border border-[color:var(--brand-border)] p-3 text-xs leading-5 text-[color:var(--brand-charcoal)]/70">
                  GPS coordinates captured. Review the address fields below and correct any details that are not accurate.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Full name *
                  </span>
                  <input
                    id="fullName"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                  {renderError("fullName")}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Email address *
                  </span>
                  <input
                    id="email"
                    type="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  {renderError("email")}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Phone number *
                  </span>
                  <div
                    className={`mt-2 flex items-center rounded-xl border bg-[color:var(--brand-cream)] focus-within:border-[color:var(--brand-primary)] ${
                      errors.phone
                        ? "border-red-500"
                        : "border-[color:var(--brand-border)]"
                    }`}
                  >
                    <span className="border-r border-[color:var(--brand-border)] px-3 py-3 text-sm font-semibold text-[color:var(--brand-deep)]">
                      +234
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="801 234 5678"
                      className="w-full rounded-r-xl bg-transparent px-3 py-3 text-sm outline-none"
                    />
                  </div>
                  {renderError("phone")}
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    Street address / house number *
                  </span>
                  <input
                    id="address"
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "address-error" : undefined}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="House number, street, area or nearby landmark"
                    className={inputClass}
                  />
                  {renderError("address")}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    City / LGA *
                  </span>
                  <input
                    id="city"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? "city-error" : undefined}
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Your city or LGA"
                    className={inputClass}
                  />
                  {renderError("city")}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[color:var(--brand-deep)]">
                    State / FCT *
                  </span>
                  <select
                    id="state"
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={errors.state ? "state-error" : undefined}
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
                  {renderError("state")}
                </label>
              </div>
            </section>

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
                {([
                  {
                    id: "standard" as const,
                    title: "Standard dispatch",
                    description: "2–4 business days",
                    price: 3500,
                  },
                  {
                    id: "priority" as const,
                    title: "Priority dispatch",
                    description: "Faster processing",
                    price: 6500,
                  },
                ]).map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    aria-pressed={form.shippingMethod === option.id}
                    onClick={() => updateField("shippingMethod", option.id)}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      form.shippingMethod === option.id
                        ? "border-[color:var(--brand-deep)] bg-[color:var(--brand-cream)]"
                        : "border-[color:var(--brand-border)] hover:border-[color:var(--brand-primary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Truck className="h-5 w-5 text-[color:var(--brand-primary)]" />
                      {form.shippingMethod === option.id && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </div>
                    <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                      {option.title}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--brand-charcoal)]/70">
                      {option.description}
                    </p>
                    <p className="mt-3 font-bold text-[color:var(--brand-deep)]">
                      {formatPrice(option.price)}
                    </p>
                  </button>
                ))}
              </div>
            </section>

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
                {([
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
                ]).map(({ id, title, description, Icon }) => (
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
                      <span className="flex items-center justify-between gap-3 font-bold text-[color:var(--brand-deep)]">
                        {title}
                        {form.paymentMethod === id && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[color:var(--brand-charcoal)]/70">
                        {description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <section className={sectionClass}>
              <h2 className="text-lg font-bold text-[color:var(--brand-deep)]">
                Order summary
              </h2>

              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--brand-deep)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/65">
                        {item.color} / {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[color:var(--brand-deep)]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-[color:var(--brand-border)]" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[color:var(--brand-charcoal)]/70">
                    Subtotal
                  </span>
                  <span className="font-semibold text-[color:var(--brand-deep)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[color:var(--brand-charcoal)]/70">
                    {form.shippingMethod === "priority"
                      ? "Priority shipping"
                      : "Standard shipping"}
                  </span>
                  <span className="font-semibold text-[color:var(--brand-deep)]">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-[color:var(--brand-border)]" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-[color:var(--brand-deep)]">
                  Total
                </span>
                <span className="text-xl font-extrabold text-[color:var(--brand-deep)]">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-6 py-4 text-sm font-bold text-white transition hover:bg-[color:var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />
                    Continue to Payment · {formatPrice(finalTotal)}
                  </>
                )}
              </button>

              <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[color:var(--brand-charcoal)]/65">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                Your order and payment will only be confirmed by the server.
              </p>

              <Link
                href="/cart"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to shopping bag
              </Link>
            </section>
          </aside>
        </div>
      </form>
    </main>
  );
}
