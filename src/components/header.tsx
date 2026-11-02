"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, Store, User, X } from "lucide-react";

import { useStore } from "@/components/store-provider";
import AnimatedLogo from "@/components/animated-logo";
import { useNonEmptyCategories } from "@/hooks/use-categories";
import { categoryHref } from "@/lib/categories";
import { SITE_NAME } from "@/lib/config";

/**
 * Main navigation, in order: "Home" first, "Admin" always last.
 * "Shop" is a dropdown: all products, every category that has at least one approved
 * product (empty categories never show), and the marketplace sellers.
 */
const SELL_ITEM = { href: "/sell", label: `Sell on ${SITE_NAME}` };
const ADMIN_ITEM = { href: "/admin/login", label: "Admin" };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/category/") || pathname.startsWith("/product/");
  if (href === "/sell") return pathname === "/sell" || pathname.startsWith("/seller");
  if (href === "/admin/login") return pathname.startsWith("/admin");
  return pathname === href || pathname.startsWith(`${href}/`);
}

// No display utility here: each use adds its own (e.g. "hidden sm:inline-flex"), because a plain
// "inline-flex" would override "hidden" (same layer, later in the stylesheet).
const iconButton =
  "h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, wishlist, openCart } = useStore();
  const categories = useNonEmptyCategories();

  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [search, setSearch] = useState("");
  const shopRef = useRef<HTMLDivElement | null>(null);

  // Close menus whenever the route changes (React's "adjust state on prop change" pattern).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setShopOpen(false);
  }

  useEffect(() => {
    if (!shopOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) setShopOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShopOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [shopOpen]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : "/shop");
    setMenuOpen(false);
  };

  const shopLinks = [
    { href: "/shop", label: "All products" },
    { href: "/shop?sort=newest", label: "New arrivals" },
    ...categories.map((category) => ({ href: categoryHref(category.slug), label: category.name })),
    { href: "/shop?sold=marketplace", label: "From our sellers" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 min-[380px]:px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 sm:min-h-20 sm:gap-3">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((value) => !value)}
              className={`${iconButton} inline-flex lg:hidden`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex min-h-11 min-w-0 shrink items-center" aria-label={`${SITE_NAME} home`}>
              <AnimatedLogo className="w-[104px] min-[360px]:w-[124px] min-[400px]:w-[140px] sm:w-[180px] xl:w-auto" />
            </Link>
          </div>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Main">
            <NavLink href="/" label="Home" active={isActive(pathname, "/")} />

            <div ref={shopRef} className="relative">
              <button
                type="button"
                aria-expanded={shopOpen}
                aria-haspopup="true"
                aria-controls="shop-menu"
                onClick={() => setShopOpen((value) => !value)}
                className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-semibold uppercase tracking-wider ${
                  isActive(pathname, "/shop")
                    ? "bg-[color:var(--brand-primary)] text-[color:var(--brand-deep)]"
                    : "text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/60"
                }`}
              >
                Shop
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
              </button>
              {shopOpen && (
                <div
                  id="shop-menu"
                  className="rf-pop absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-[color:var(--brand-border)] bg-white p-2 shadow-[0_18px_45px_rgba(91,64,50,0.14)]"
                >
                  {shopLinks.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShopOpen(false)}
                      className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-cream)] ${
                        index === shopLinks.length - 1 ? "mt-1 border-t border-[color:var(--brand-border)] pt-1" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink href={SELL_ITEM.href} label={SELL_ITEM.label} active={isActive(pathname, SELL_ITEM.href)} />
            <NavLink href={ADMIN_ITEM.href} label={ADMIN_ITEM.label} active={isActive(pathname, ADMIN_ITEM.href)} />
          </nav>

          <div className="hidden max-w-xs flex-1 justify-center xl:flex">
            <form onSubmit={onSearch} className="w-full" role="search">
              <label className="sr-only" htmlFor="header-search">
                Search products
              </label>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5">
                <Search className="h-4 w-4 shrink-0 text-[color:var(--brand-chocolate)]/60" />
                <input
                  id="header-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the shop..."
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                />
              </div>
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <Link href="/account" className={`${iconButton} hidden sm:inline-flex`} aria-label="Account">
              <User className="h-4 w-4" />
            </Link>

            <Link href="/wishlist" className={`${iconButton} relative hidden sm:inline-flex`} aria-label="Saved items">
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-1 text-[9px] font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/seller/signup"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] px-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)] sm:px-4"
            >
              <Store className="h-4 w-4 shrink-0" />
              <span className="xl:hidden">Sell</span>
              <span className="hidden xl:inline">Sell with us</span>
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={itemCount > 0 ? `Open shopping bag, ${itemCount} item${itemCount === 1 ? "" : "s"}` : "Open shopping bag"}
              className="relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-3 text-xs font-semibold text-[color:var(--brand-deep)] sm:px-3.5"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--brand-deep)] px-1 text-[10px] font-bold text-white sm:static sm:h-4 sm:min-w-4">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="rf-pop max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-[color:var(--brand-border)] py-4 lg:hidden">
            <form onSubmit={onSearch} className="mb-3" role="search">
              <label className="sr-only" htmlFor="mobile-search">
                Search products
              </label>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  id="mobile-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the shop..."
                  className="w-full min-w-0 bg-transparent text-base outline-none"
                />
              </div>
            </form>

            <nav
              aria-label="Mobile"
              className="space-y-1"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
              }}
            >
              <MobileLink href="/" label="Home" active={isActive(pathname, "/")} />

              <div className="rounded-2xl bg-white/70 py-1">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Shop</p>
                {shopLinks.map((item) => (
                  <MobileLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} nested />
                ))}
              </div>

              <MobileLink href={SELL_ITEM.href} label={SELL_ITEM.label} active={isActive(pathname, SELL_ITEM.href)} />
              <MobileLink href={ADMIN_ITEM.href} label={ADMIN_ITEM.label} active={isActive(pathname, ADMIN_ITEM.href)} />

              <Link
                href="/seller/signup"
                className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-4 text-xs font-bold uppercase tracking-wider text-white"
              >
                <Store className="h-4 w-4" /> Create seller account
              </Link>

              <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[color:var(--brand-border)] pt-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    openCart();
                    setMenuOpen(false);
                  }}
                  className="min-h-11 rounded-xl bg-white px-2"
                >
                  Bag ({itemCount})
                </button>
                <Link href="/wishlist" className="flex min-h-11 items-center justify-center rounded-xl bg-white px-2">
                  Saved ({wishlist.length})
                </Link>
                <Link href="/account" className="flex min-h-11 items-center justify-center rounded-xl bg-white px-2">
                  Account
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold uppercase tracking-wider ${
        active
          ? "bg-[color:var(--brand-primary)] text-[color:var(--brand-deep)]"
          : "text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/60"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label, active, nested = false }: { href: string; label: string; active: boolean; nested?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center rounded-xl px-3 font-semibold ${
        nested ? "text-sm normal-case" : "text-sm uppercase tracking-wider"
      } ${active ? "bg-[color:var(--brand-primary)]/25 text-[color:var(--brand-deep)]" : "text-[color:var(--brand-charcoal)] hover:bg-white"}`}
    >
      {label}
    </Link>
  );
}
