"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useRouter, Link, usePathname } from "@/i18n/navigation";
import { Spinner, UserAvatar } from "@/components/ui";
import Navbar from "@/components/layout/Navbar";
import SupportFab from "@/components/support/SupportFab";
import api from "@/lib/api";

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-stone/10 text-stone",
  managed: "bg-[#c9a227]/15 text-[#9c7a1a]",
  premium: "bg-[#1f1b16]/10 text-[#1f1b16]",
};

interface Badges { pending_sellers?: number; pending_products?: number; unread_messages?: number; pending_orders?: number; support_tickets?: number; unread_support?: number }
interface ManagedAccount { id: number; name: string; plan: "managed" | "premium"; seller: { store_name: string; store_slug: string } | null }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tSeller = useTranslations("seller");
  const tPlans = useTranslations("plans");
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [badges, setBadges] = useState<Badges>({});
  const [managedAccounts, setManagedAccounts] = useState<ManagedAccount[]>([]);
  const [managedOpen, setManagedOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [managedSubOpen, setManagedSubOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevBadges = useRef<Badges>({});
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!user) return;

    const fetchBadges = () =>
      api.get("/notifications").then(r => {
        const next: Badges = r.data;
        const prev = prevBadges.current;

        // Toast when admin gets new support ticket
        if (user.role === "admin") {
          const newTickets = (next.support_tickets ?? 0) - (prev.support_tickets ?? 0);
          if (newTickets > 0 && Object.keys(prev).length > 0) {
            showToast(newTickets === 1 ? "New support ticket received" : `${newTickets} new support tickets`);
          }
        }

        // Toast when user gets a reply
        if (user.role !== "admin") {
          const newReplies = (next.unread_support ?? 0) - (prev.unread_support ?? 0);
          if (newReplies > 0 && Object.keys(prev).length > 0) {
            showToast("Your support ticket received a reply");
          }
        }

        prevBadges.current = next;
        setBadges(next);
      }).catch(() => {});

    fetchBadges();

    if (user.role === "admin") {
      api.get("/admin/managed-sellers").then(r => setManagedAccounts(r.data)).catch(() => {});
    }

    const pollInterval = setInterval(fetchBadges, 30000);

    if (user.role === "seller") {
      const fetchPending = () =>
        api.get("/seller/orders/pending-count").then(r => {
          setBadges(b => ({ ...b, pending_orders: r.data.count ?? 0 }));
        }).catch(() => {});
      fetchPending();
      const orderId = setInterval(fetchPending, 15000);
      return () => { clearInterval(pollInterval); clearInterval(orderId); };
    }

    return () => clearInterval(pollInterval);
  }, [user?.role]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auto-expand the managed section when on a managed-sellers page
  useEffect(() => {
    if (pathname.startsWith("/admin/managed-sellers")) {
      setManagedOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLink = (href: string, label: string, badge?: number) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-sm text-sm transition-colors ${
          active ? "bg-gold/20 text-gold-deep font-medium" : "text-stone hover:text-ink hover:bg-sand"
        }`}
      >
        <span>{label}</span>
        {badge && badge > 0 ? (
          <span className="text-[10px] font-bold bg-amber-400 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />

      <div className="flex flex-1">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-5 start-5 z-40 bg-gold text-ink rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Desktop sidebar — always visible, sticky */}
      <aside className="hidden md:flex w-56 shrink-0 border-e border-stone/20 bg-white flex-col sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto">
        {/* User info */}
        <div className="px-4 py-4 border-b border-stone/10 flex items-center gap-3">
          <UserAvatar name={user?.name} avatarPath={user?.avatar_path} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-stone capitalize mt-0.5">{user?.role}</p>
            {user?.role === "seller" && user?.plan && (
              <span className={`inline-block mt-1 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[user.plan] ?? PLAN_COLORS.starter}`}>
                {tPlans(`${user.plan}Name`)}
              </span>
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {user?.role === "admin" && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-stone px-3 mb-1">{tAdmin("analytics")}</p>
              {navLink("/admin/analytics", tAdmin("analytics"))}
              <p className="text-[10px] uppercase tracking-widest text-stone px-3 mt-3 mb-1">Manage</p>
              {navLink("/admin/users", tAdmin("users"))}
              {navLink("/admin/sellers", tAdmin("sellers"), badges.pending_sellers)}
              {/* Managed & Premium expandable tree */}
              {(() => {
                const premiumAccounts = managedAccounts.filter(a => a.plan === "premium");
                const managedOnlyAccounts = managedAccounts.filter(a => a.plan === "managed");
                const isOnManagedPage = pathname.startsWith("/admin/managed-sellers");
                return (
                  <div>
                    <button
                      onClick={() => setManagedOpen(o => !o)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors ${isOnManagedPage ? "bg-gold/20 text-gold-deep font-medium" : "text-stone hover:text-ink hover:bg-sand"}`}
                    >
                      <span>Managed &amp; Premium</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${managedOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>

                    {managedOpen && (
                      <div className="ms-3 mt-0.5 border-s border-stone/15 ps-2 space-y-0.5">
                        {/* All accounts link */}
                        <Link href="/admin/managed-sellers"
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs transition-colors ${pathname === "/admin/managed-sellers" ? "text-gold-deep font-semibold" : "text-stone hover:text-ink"}`}>
                          All accounts
                        </Link>

                        {/* Premium sub-group */}
                        {premiumAccounts.length > 0 && (
                          <div>
                            <button onClick={() => setPremiumOpen(o => !o)}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-stone hover:text-ink transition-colors rounded-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-ink/60 inline-block"/>
                                Premium ({premiumAccounts.length})
                              </span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${premiumOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            {premiumOpen && (
                              <div className="ms-3 border-s border-stone/10 ps-2 space-y-0.5">
                                {premiumAccounts.map(a => {
                                  const label = a.seller?.store_name ?? a.name;
                                  const href = `/admin/managed-sellers/${a.id}`;
                                  return (
                                    <Link key={a.id} href={href}
                                      className={`block px-2 py-1 rounded-sm text-xs truncate transition-colors ${pathname.startsWith(href) ? "text-gold-deep font-semibold" : "text-stone hover:text-ink"}`}>
                                      {label}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Managed sub-group */}
                        {managedOnlyAccounts.length > 0 && (
                          <div>
                            <button onClick={() => setManagedSubOpen(o => !o)}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-stone hover:text-ink transition-colors rounded-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-deep/60 inline-block"/>
                                Managed ({managedOnlyAccounts.length})
                              </span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${managedSubOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            {managedSubOpen && (
                              <div className="ms-3 border-s border-stone/10 ps-2 space-y-0.5">
                                {managedOnlyAccounts.map(a => {
                                  const label = a.seller?.store_name ?? a.name;
                                  const href = `/admin/managed-sellers/${a.id}`;
                                  return (
                                    <Link key={a.id} href={href}
                                      className={`block px-2 py-1 rounded-sm text-xs truncate transition-colors ${pathname.startsWith(href) ? "text-gold-deep font-semibold" : "text-stone hover:text-ink"}`}>
                                      {label}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {managedAccounts.length === 0 && (
                          <p className="px-2 py-1 text-xs text-stone/50 italic">No accounts yet</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              {navLink("/admin/products", tAdmin("products"), badges.pending_products)}
              {navLink("/admin/orders", tAdmin("orders"))}
              {navLink("/admin/categories", tAdmin("categories"))}
              {navLink("/admin/reviews", "Reviews")}
              {navLink("/admin/subscriptions", "Subscriptions")}
              {navLink("/admin/conversations", tAdmin("conversations"), badges.unread_messages)}
              {navLink("/admin/penalties", tAdmin("penalties"))}
              {navLink("/admin/support", tAdmin("support"), badges.support_tickets)}
            </>
          )}

          {user?.role === "seller" && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-stone px-3 mb-1">Store</p>
              {/* only starter creates/manages their own store */}
              {user.plan === "starter" && navLink("/seller/store", tSeller("myStore"))}
              {/* starter + managed can add their own products */}
              {(user.plan === "starter" || user.plan === "managed") && (
                navLink("/seller/products", tSeller("myProducts"))
              )}
              {/* only starter handles their own orders */}
              {user.plan === "starter" && (
                navLink("/seller/orders", tSeller("incomingOrders"), badges.pending_orders)
              )}
              {navLink("/seller/reviews", tSeller("myReviews"))}
              {navLink("/seller/subscription", "Subscription")}
            </>
          )}

          <p className="text-[10px] uppercase tracking-widest text-stone px-3 mt-3 mb-1">Account</p>
          {navLink("/profile", "My Profile")}
          {navLink("/customer/orders", t("myOrders"))}
          {navLink("/customer/wishlist", t("myWishlist"))}
          {navLink("/messages", t("messages"), badges.unread_messages)}
          {navLink("/support/tickets", t("support"), badges.unread_support)}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-stone/10">
          <button
            onClick={handleLogout}
            className="text-sm text-stone hover:text-henna transition-colors w-full text-start"
          >
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar — fixed overlay, slides in */}
      <aside className={`md:hidden fixed inset-y-0 start-0 z-50 w-72 bg-white border-e border-stone/20 flex flex-col overflow-y-auto transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"}`}>
        {/* Close button */}
        <div className="flex justify-end px-3 pt-3 shrink-0">
          <button onClick={() => setSidebarOpen(false)} className="text-stone hover:text-ink p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {/* User info */}
        <div className="px-4 py-3 border-b border-stone/10 flex items-center gap-3">
          <UserAvatar name={user?.name} avatarPath={user?.avatar_path} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-stone capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {user?.role === "seller" && (
            <>
              <p className="text-[10px] uppercase tracking-widest text-stone px-3 mb-1">Store</p>
              {user.plan === "starter" && navLink("/seller/store", tSeller("myStore"))}
              {(user.plan === "starter" || user.plan === "managed") && navLink("/seller/products", tSeller("myProducts"))}
              {user.plan === "starter" && navLink("/seller/orders", tSeller("incomingOrders"), badges.pending_orders)}
              {navLink("/seller/reviews", tSeller("myReviews"))}
              {navLink("/seller/subscription", "Subscription")}
            </>
          )}
          {user?.role === "admin" && (
            <>
              {navLink("/admin/analytics", tAdmin("analytics"))}
              {navLink("/admin/users", tAdmin("users"))}
              {navLink("/admin/sellers", tAdmin("sellers"), badges.pending_sellers)}
              {navLink("/admin/products", tAdmin("products"), badges.pending_products)}
              {navLink("/admin/orders", tAdmin("orders"))}
              {navLink("/admin/categories", tAdmin("categories"))}
              {navLink("/admin/reviews", "Reviews")}
              {navLink("/admin/subscriptions", "Subscriptions")}
              {navLink("/admin/support", tAdmin("support"), badges.support_tickets)}
            </>
          )}
          <p className="text-[10px] uppercase tracking-widest text-stone px-3 mt-3 mb-1">Account</p>
          {navLink("/profile", "My Profile")}
          {navLink("/customer/orders", t("myOrders"))}
          {navLink("/customer/wishlist", t("myWishlist"))}
          {navLink("/messages", t("messages"), badges.unread_messages)}
          {navLink("/support/tickets", t("support"), badges.unread_support)}
        </nav>
        <div className="px-4 py-4 border-t border-stone/10 shrink-0">
          <button onClick={handleLogout} className="text-sm text-stone hover:text-henna transition-colors w-full text-start">
            {t("logout")}
          </button>
        </div>
      </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Plan banner for managed / premium sellers */}
          {user?.role === "seller" && user?.plan !== "starter" && (
            <div className={`mb-6 rounded-xl border px-5 py-4 flex items-start gap-4 ${
              user.plan === "premium"
                ? "bg-[#1f1b16] border-[#1f1b16] text-white"
                : "bg-[#c9a227]/10 border-[#c9a227]/40 text-[#1f1b16]"
            }`}>
              {/* Icon */}
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
                user.plan === "premium" ? "bg-[#c9a227]" : "bg-[#c9a227]/20"
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={user.plan === "premium" ? "#1f1b16" : "#c9a227"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${user.plan === "premium" ? "text-white" : "text-[#1f1b16]"}`}>
                  {user.plan === "premium" ? tPlans("premiumBannerTitle") : tPlans("managedBannerTitle")}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${user.plan === "premium" ? "text-white/60" : "text-[#8b8378]"}`}>
                  {user.plan === "premium" ? tPlans("premiumBannerDesc") : tPlans("managedBannerDesc")}
                </p>
              </div>
              <a
                href="mailto:contact@maadinemarrakech.com"
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                  user.plan === "premium"
                    ? "bg-[#c9a227] text-[#1f1b16] hover:bg-[#d4aa2e]"
                    : "bg-[#c9a227] text-[#1f1b16] hover:bg-[#d4aa2e]"
                }`}
              >
                {tPlans("contactTeam")}
              </a>
            </div>
          )}

          {/* Upgrade prompt for starter sellers */}
          {user?.role === "seller" && user?.plan === "starter" && (
            <div className="mb-6 rounded-xl border border-stone/20 bg-white px-5 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-stone">{tPlans("upgradePrompt")}</p>
              <Link href="/plans" className="text-xs font-semibold text-gold-deep hover:underline shrink-0">
                {tPlans("upgradeCta")} →
              </Link>
            </div>
          )}

          {children}
        </main>
      </div>
      <SupportFab />

      {/* Support notification toast */}
      {toast && (
        <div
          className="fixed top-5 end-5 z-50 flex items-center gap-3 bg-[#1f1b16] text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 max-w-xs"
          onClick={() => setToast(null)}
        >
          <span className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span className="flex-1">{toast}</span>
          <button className="text-white/40 hover:text-white shrink-0" onClick={() => setToast(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
