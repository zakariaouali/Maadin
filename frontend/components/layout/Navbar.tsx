"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";

const locales = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="border-b border-stone/20 bg-sand sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Marrakech Maadine" width={36} height={22} />
            <span className="font-display text-lg text-ink hidden sm:block">
              Marrakech Maadine
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-ink hover:text-gold-deep transition-colors">
              {t("products")}
            </Link>
            {isAuthenticated && (
              <Link href="/messages" className="text-sm text-ink hover:text-gold-deep transition-colors">
                {t("messages")}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs">
              {locales.map((l, i) => (
                <span key={l.code} className="flex items-center">
                  {i > 0 && <span className="text-stone mx-1">/</span>}
                  <button
                    onClick={() => switchLocale(l.code)}
                    className={
                      locale === l.code
                        ? "text-gold-deep font-semibold"
                        : "text-stone hover:text-ink"
                    }
                  >
                    {l.label}
                  </button>
                </span>
              ))}
            </div>

            <Link href="/cart" className="relative text-ink hover:text-gold-deep transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-henna text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-sm text-ink hover:text-gold-deep transition-colors"
                >
                  {user?.name}
                </button>
                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-48 bg-white border border-stone/20 rounded-sm shadow-sm py-1">
                    <Link
                      href="/customer/orders"
                      className="block px-4 py-2 text-sm text-ink hover:bg-sand"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t("myOrders")}
                    </Link>
                    <Link
                      href="/customer/wishlist"
                      className="block px-4 py-2 text-sm text-ink hover:bg-sand"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t("myWishlist")}
                    </Link>
                    {user?.role === "seller" && (
                      <Link
                        href="/seller/products"
                        className="block px-4 py-2 text-sm text-ink hover:bg-sand"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t("sellerDashboard")}
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        href="/admin/analytics"
                        className="block px-4 py-2 text-sm text-ink hover:bg-sand"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-start px-4 py-2 text-sm text-henna hover:bg-sand"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-gold hover:bg-gold-deep text-ink px-4 py-1.5 rounded-sm transition-colors"
              >
                {t("login")}
              </Link>
            )}

            <button
              className="md:hidden text-ink"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-3 pb-4 pt-2 border-t border-stone/20">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm text-ink">
              {t("products")}
            </Link>
            {isAuthenticated && (
              <Link href="/messages" onClick={() => setMenuOpen(false)} className="text-sm text-ink">
                {t("messages")}
              </Link>
            )}
            <div className="flex gap-3 pt-2">
              {locales.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={
                    locale === l.code
                      ? "text-gold-deep font-semibold text-sm"
                      : "text-stone text-sm"
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}