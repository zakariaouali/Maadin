"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";
import { UserAvatar } from "@/components/ui";
import api from "@/lib/api";
import SearchBar from "@/components/layout/SearchBar";
import NotificationBell from "@/components/layout/NotificationBell";

const locales = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
];

function useNotifications(enabled: boolean) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingSellers, setPendingSellers] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const poll = async () => {
      try {
        const { data } = await api.get("/notifications");
        setUnreadMessages(data.unread_messages ?? 0);
        setPendingSellers(data.pending_sellers ?? 0);
        setPendingProducts(data.pending_products ?? 0);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [enabled]);

  return { unreadMessages, pendingSellers, pendingProducts };
}

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { unreadMessages, pendingSellers, pendingProducts } = useNotifications(isAuthenticated);
  const urgentAdmin = pendingSellers + pendingProducts;

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/products", label: locale === "ar" ? "المنتجات" : locale === "fr" ? "Produits" : "Products" },
    // "Sell with us" only for guests and customers — sellers already have a store
    ...(!user || user.role === "customer"
      ? [{ href: "/plans", label: locale === "ar" ? "بع معنا" : locale === "fr" ? "Vendre avec nous" : "Sell with us", highlight: true }]
      : []),
  ];

  const menuItems = [
    {
      href: "/profile",
      label: locale === "ar" ? "ملفي" : locale === "fr" ? "Mon profil" : "My Profile",
      icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
    },
    {
      href: "/customer/orders",
      label: locale === "ar" ? "طلباتي" : locale === "fr" ? "Mes commandes" : "My Orders",
      icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
    },
    {
      href: "/customer/wishlist",
      label: locale === "ar" ? "المفضلة" : locale === "fr" ? "Favoris" : "Wishlist",
      icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    },
    {
      href: "/messages",
      label: locale === "ar" ? "الرسائل" : locale === "fr" ? "Messages" : "Messages",
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
      badge: unreadMessages,
    },
  ];

  return (
    <header className="bg-white border-b border-stone/15 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/logo.png"
                alt="Marrakech Maadine"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-xl text-ink group-hover:text-gold-deep transition-colors">
                Marrakech Maadine
              </span>
              <span className="text-[10px] text-stone tracking-widest uppercase">
                {locale === "ar" ? "سوق الحرفيين" : locale === "fr" ? "Marché artisanal" : "Artisan Marketplace"}
              </span>
            </div>
          </Link>

          {/* Desktop search bar */}
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <SearchBar />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={l.highlight
                  ? "px-4 py-2 text-sm font-semibold text-gold-deep hover:text-ink hover:bg-gold/10 rounded-sm transition-colors border border-gold/30"
                  : "px-4 py-2 text-sm font-medium text-stone hover:text-ink hover:bg-sand rounded-sm transition-colors"}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Locale switcher */}
            <div className="hidden sm:flex items-center rounded-sm border border-stone/20 divide-x divide-stone/20 overflow-hidden text-[11px]">
              {locales.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`px-2.5 py-1 transition-colors ${
                    locale === l.code
                      ? "bg-ink text-white font-semibold"
                      : "text-stone hover:text-ink hover:bg-sand"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                href="/customer/wishlist"
                className="relative p-2 text-stone hover:text-henna transition-colors rounded-sm hover:bg-sand"
                aria-label="Wishlist"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </Link>
            )}

            {/* Messages */}
            {isAuthenticated && (
              <Link
                href="/messages"
                className="relative p-2 text-stone hover:text-gold-deep transition-colors rounded-sm hover:bg-sand"
                aria-label="Messages"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {unreadMessages > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-henna text-white text-[9px] rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center font-bold">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            )}

            {/* Notification bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-stone hover:text-gold-deep transition-colors rounded-sm hover:bg-sand"
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gold text-ink text-[9px] rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 ps-2 pe-1 py-1.5 rounded-sm hover:bg-sand transition-colors"
                >
                  <UserAvatar name={user?.name} avatarPath={user?.avatar_path} size={28} />
                  <span className="hidden sm:block text-sm text-ink font-medium">{user?.name?.split(" ")[0]}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-white border border-stone/20 rounded-sm shadow-xl py-1 z-50">
                    <div className="px-4 py-3 border-b border-stone/10 bg-sand/50 flex items-center gap-3">
                      <UserAvatar name={user?.name} avatarPath={user?.avatar_path} size={40} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                        <p className="text-[11px] text-stone truncate">{user?.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-gold-deep font-semibold bg-gold/10 px-2 py-0.5 rounded-sm">
                          {user?.role}
                        </span>
                      </div>
                    </div>

                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone shrink-0">
                          {item.icon}
                        </svg>
                        {item.label}
                        {item.badge && item.badge > 0 ? (
                          <span className="ms-auto bg-henna text-white text-[10px] rounded-full px-1.5 py-0.5 font-medium">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}

                    {user?.role === "seller" && (
                      <Link
                        href="/seller/products"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone shrink-0">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        {locale === "ar" ? "لوحة البائع" : locale === "fr" ? "Tableau vendeur" : "Seller Dashboard"}
                      </Link>
                    )}

                    {user?.role === "admin" && (
                      <Link
                        href="/admin/analytics"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone shrink-0">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                        {locale === "ar" ? "لوحة الإدارة" : locale === "fr" ? "Administration" : "Admin Dashboard"}
                        {urgentAdmin > 0 && (
                          <span className="ms-auto bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-medium">{urgentAdmin}</span>
                        )}
                      </Link>
                    )}

                    <div className="border-t border-stone/10 mt-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-henna hover:bg-red-50 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {locale === "ar" ? "تسجيل الخروج" : locale === "fr" ? "Déconnexion" : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ms-1 text-sm bg-ink hover:bg-gold-deep text-white px-4 py-2 rounded-sm transition-colors font-medium"
              >
                {locale === "ar" ? "دخول" : locale === "fr" ? "Connexion" : "Sign in"}
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-ink rounded-sm hover:bg-sand"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone/15 bg-white">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <SearchBar onClose={() => setMenuOpen(false)} />
          </div>
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-ink rounded-sm hover:bg-sand"
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="my-1 border-t border-stone/10" />
                {/* Mobile user identity */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar name={user?.name} avatarPath={user?.avatar_path} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                    <p className="text-[11px] text-stone truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="my-1 border-t border-stone/10" />
                <Link href="/customer/orders" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-ink rounded-sm hover:bg-sand">
                  {locale === "ar" ? "طلباتي" : locale === "fr" ? "Mes commandes" : "My Orders"}
                </Link>
                <Link href="/customer/wishlist" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-ink rounded-sm hover:bg-sand">
                  {locale === "ar" ? "المفضلة" : locale === "fr" ? "Favoris" : "Wishlist"}
                </Link>
                <Link href="/messages" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-ink rounded-sm hover:bg-sand flex items-center gap-2">
                  {locale === "ar" ? "الرسائل" : locale === "fr" ? "Messages" : "Messages"}
                  {unreadMessages > 0 && <span className="bg-henna text-white text-[10px] rounded-full px-1.5 py-0.5">{unreadMessages}</span>}
                </Link>
                <div className="my-1 border-t border-stone/10" />
                <button onClick={handleLogout} className="px-3 py-2.5 text-sm text-henna rounded-sm hover:bg-red-50 text-start">
                  {locale === "ar" ? "تسجيل الخروج" : locale === "fr" ? "Déconnexion" : "Sign out"}
                </button>
              </>
            )}
          </nav>
          <div className="px-4 py-3 border-t border-stone/10 flex items-center gap-2">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => { switchLocale(l.code); setMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded-sm font-medium transition-colors ${
                  locale === l.code ? "bg-ink text-white" : "text-stone hover:bg-sand"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
