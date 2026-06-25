"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner } from "@/components/ui";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { Link } from "@/i18n/navigation";

interface ManagedUser {
  id: number; name: string; email: string;
  plan: "managed" | "premium";
  subscription_expires_at: string | null; monthly_fee: string | null;
  seller: { store_name: string; store_slug: string; logo_path: string | null; status: string } | null;
}

function daysUntil(date: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function ManagedSellersPage() {
  const [accounts, setAccounts] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "managed" | "premium">("all");

  useEffect(() => {
    api.get("/admin/managed-sellers").then(r => setAccounts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? accounts : accounts.filter(a => a.plan === filter);
  const premiumCount = accounts.filter(a => a.plan === "premium").length;
  const managedCount = accounts.filter(a => a.plan === "managed").length;
  const expiredCount = accounts.filter(a => { const d = daysUntil(a.subscription_expires_at); return d !== null && d < 0; }).length;
  const urgentCount  = accounts.filter(a => { const d = daysUntil(a.subscription_expires_at); return d !== null && d >= 0 && d <= 3; }).length;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Managed &amp; Premium Accounts</h1>
          <p className="text-sm text-stone mt-0.5">{accounts.length} account{accounts.length !== 1 ? "s" : ""} you manage directly</p>
        </div>
        {(expiredCount > 0 || urgentCount > 0) && (
          <div className="flex gap-2 flex-wrap">
            {expiredCount > 0 && <span className="bg-henna/10 text-henna text-xs font-bold px-3 py-1.5 rounded-full">{expiredCount} expired</span>}
            {urgentCount > 0  && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">{urgentCount} expiring soon</span>}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { v: accounts.length, l: "Total",   c: "bg-white" },
          { v: premiumCount,    l: "Premium", c: "bg-ink/5" },
          { v: managedCount,    l: "Managed", c: "bg-gold/5" },
          { v: accounts.filter(a => !a.seller).length, l: "No store yet", c: "bg-henna/5" },
        ].map(s => (
          <div key={s.l} className={`${s.c} rounded-2xl border border-stone/10 p-4 text-center`}>
            <p className="text-2xl font-bold text-ink">{s.v}</p>
            <p className="text-[10px] text-stone uppercase tracking-wider mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-stone/10 p-1 w-fit">
        {(["all", "premium", "managed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-gold text-ink" : "text-stone hover:text-ink"}`}>
            {f === "all" ? `All (${accounts.length})` : f === "premium" ? `Premium (${premiumCount})` : `Managed (${managedCount})`}
          </button>
        ))}
      </div>

      {/* Account cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone">
          <p className="text-lg font-medium">No accounts</p>
          <p className="text-sm mt-1">Sellers who choose Managed or Premium plans will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const logoUrl = getImageUrl(a.seller?.logo_path ?? undefined);
            const days = daysUntil(a.subscription_expires_at);
            const expired = days !== null && days < 0;
            const urgent  = days !== null && days >= 0 && days <= 3;
            return (
              <Link key={a.id} href={`/admin/managed-sellers/${a.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-stone/10 px-5 py-4 hover:border-gold/30 hover:shadow-sm transition-all group">

                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-gold/10 border border-gold/20 shrink-0 flex items-center justify-center">
                  {logoUrl ? <Image src={logoUrl} alt={a.name} width={44} height={44} className="object-cover w-full h-full" /> : <span className="text-base font-bold text-gold-deep">{a.name.charAt(0)}</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{a.seller?.store_name ?? a.name}</p>
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${a.plan === "premium" ? "bg-ink/10 text-ink" : "bg-gold/15 text-gold-deep"}`}>{a.plan}</span>
                    {a.seller && (
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${a.seller.status === "verified" ? "bg-green-50 text-green-700" : "bg-henna/10 text-henna"}`}>{a.seller.status}</span>
                    )}
                  </div>
                  <p className="text-xs text-stone truncate">{a.email}</p>
                  {!a.seller && <p className="text-[10px] text-henna mt-0.5 font-medium">No store created yet</p>}
                </div>

                {/* Subscription */}
                <div className="text-right shrink-0 hidden sm:block">
                  {a.monthly_fee && <p className="text-sm font-bold text-ink">{Number(a.monthly_fee).toLocaleString()} MAD/mo</p>}
                  {days === null ? (
                    <p className="text-xs text-stone/50">No expiry set</p>
                  ) : expired ? (
                    <p className="text-xs text-henna font-semibold">Expired {Math.abs(days)}d ago</p>
                  ) : urgent ? (
                    <p className="text-xs text-amber-600 font-semibold animate-pulse">Expires in {days}d</p>
                  ) : (
                    <p className="text-xs text-green-700 font-semibold">{days}d remaining</p>
                  )}
                </div>

                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone group-hover:text-gold-deep transition-colors shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
