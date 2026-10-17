"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { useStore } from "@/components/store-provider";
import AnimatedLogo from "@/components/animated-logo";

const navItems = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=graphic-tees", label: "Graphic Tees" },
  { href: "/shop?category=hoodies", label: "Streetwear" },
  { href: "/shop?category=cargos", label: "Cargos & Denim" },
  { href: "/shop?category=co-ords", label: "Co-Ords & Sets" },
  { href: "/shop?category=blazers", label: "Tailoring" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, wishlist, openCart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) {
      router.push("/shop");
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Mobile menu button & brand logo */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] lg:hidden hover:bg-[color:var(--brand-soft)] transition"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Rebel Fashion home">
              <span className="flex items-center">
                <AnimatedLogo className="min-w-[140px]" />
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 xl:gap-2 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "rounded-full bg-[color:var(--brand-primary)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-2xs"
                      : "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/60 hover:text-[color:var(--brand-deep)] transition"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search bar */}
          <div className="hidden flex-1 justify-center max-w-xs md:flex">
            <form onSubmit={onSearch} className="w-full">
              <label className="sr-only" htmlFor="header-search">
                Search products
              </label>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5 py-2 shadow-2xs focus-within:border-[color:var(--brand-primary)] transition">
                <Search className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
                <input
                  id="header-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tees, denim, cargos..."
                  className="w-full border-none bg-transparent text-xs text-[color:var(--brand-charcoal)] placeholder:text-[color:var(--brand-charcoal)]/45 focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] hover:bg-[color:var(--brand-soft)]/60 transition shadow-2xs"
              title="My Account"
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              href="/wishlist"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] hover:bg-[color:var(--brand-soft)]/60 transition shadow-2xs"
              title="Saved Items"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-1 text-[9px] font-bold text-[color:var(--brand-deep)]">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-3.5 text-xs font-semibold text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              {itemCount > 0 ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-deep)] px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen ? (
          <div className="border-t border-[color:var(--brand-border)] py-4 lg:hidden">
            <form onSubmit={onSearch} className="mb-4">
              <label className="sr-only" htmlFor="mobile-search">
                Search products
              </label>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3 py-2">
                <Search className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
                <input
                  id="mobile-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tees, jackets, sneakers..."
                  className="w-full border-none bg-transparent text-sm text-[color:var(--brand-charcoal)] placeholder:text-[color:var(--brand-charcoal)]/50 focus:outline-none"
                />
              </div>
            </form>

            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/60"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[color:var(--brand-border)] flex items-center justify-between text-sm px-3 font-medium text-[color:var(--brand-deep)]">
                <Link href="/account" onClick={() => setMenuOpen(false)} className="hover:underline">
                  Account
                </Link>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="hover:underline">
                  Wishlist ({wishlist.length})
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
