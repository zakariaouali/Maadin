"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useRouter, Link, usePathname } from "@/i18n/navigation";
import { Spinner, UserAvatar } from "@/components/ui";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-stone/10 text-stone",
  managed: "bg-[#c9a227]/15 text-[#9c7a1a]",
  premium: "bg-[#1f1b16]/10 text-[#1f1b16]",
};

interface Badges { pending_sellers?: number; pending_products?: number; unread_messages?: number }
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

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/notifications").then(r => setBadges(r.data)).catch(() => {});
      api.get("/admin/managed-sellers").then(r => setManagedAccounts(r.data)).catch(() => {});
    }
  }, [user?.role]);

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
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-e border-stone/20 bg-white flex flex-col sticky top-16 self-start h-[calc(100vh-4rem)]">
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
              {navLink("/admin/conversations", tAdmin("conversations"), badges.unread_messages)}
              {navLink("/admin/penalties", tAdmin("penalties"))}
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
                navLink("/seller/orders", tSeller("incomingOrders"))
              )}
            </>
          )}

          <p className="text-[10px] uppercase tracking-widest text-stone px-3 mt-3 mb-1">Account</p>
          {navLink("/profile", "My Profile")}
          {navLink("/customer/orders", t("myOrders"))}
          {navLink("/customer/wishlist", t("myWishlist"))}
          {navLink("/messages", t("messages"))}
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

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 md:p-8">
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
                href="mailto:contact@maadine.ma"
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
    </div>
  );
}
