"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import api from "@/lib/api";
import { Spinner, Modal, OrderStatusBadge } from "@/components/ui";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { Link } from "@/i18n/navigation";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface AccountDetail {
  user: {
    id: number; name: string; email: string; phone: string | null;
    plan: "managed" | "premium"; subscription_expires_at: string | null; monthly_fee: string | null;
  };
  seller: {
    id: number; store_name: string; store_slug: string; logo_path: string | null;
    banner_path: string | null; store_description: string | null; status: string;
    phone_number: string | null; bank_name: string | null; bank_account_number: string | null;
    products_count: number; orders_count: number;
  } | null;
  orders: { id: number; status: string; total_price: string; created_at: string; customer: { name: string } | null }[];
  products: { id: number; name: string; price: string; is_active: boolean; is_approved: boolean; stock_quantity: number; created_at: string; primary_image?: { image_path: string } | null }[];
  conversations: { id: number; unread_count: number; last_message_at: string; buyer: { name: string; avatar_path: string | null }; product: { name: string } | null }[];
}

const TABS = ["Overview", "Orders", "Messages", "Products", "Subscription"] as const;
type Tab = typeof TABS[number];

function daysUntil(date: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Subscription panel ─────────────────────────────────────────────────── */
function SubscriptionPanel({ user, onUpdated }: { user: AccountDetail["user"]; onUpdated: (u: AccountDetail["user"]) => void }) {
  const days = daysUntil(user.subscription_expires_at);
  const expired = days !== null && days < 0;
  const urgent  = days !== null && days <= 3 && !expired;

  const [form, setForm] = useState({
    subscription_expires_at: user.subscription_expires_at?.slice(0, 10) ?? "",
    monthly_fee: user.monthly_fee ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const res = await api.put(`/admin/managed-sellers/${user.id}/subscription`, form);
      onUpdated({ ...user, ...res.data });
      setMsg("Subscription updated.");
    } catch { setMsg("Failed to update."); }
    finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-stone/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";
  const lbl = "block text-xs font-semibold text-stone uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className={`rounded-2xl border p-5 ${expired ? "bg-henna/5 border-henna/30" : urgent ? "bg-amber-50 border-amber-200" : user.subscription_expires_at ? "bg-green-50 border-green-200" : "bg-sand border-stone/10"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-stone">Subscription status</p>
            {!user.subscription_expires_at ? (
              <p className="text-lg font-bold text-stone mt-1">Not set</p>
            ) : expired ? (
              <p className="text-lg font-bold text-henna mt-1">Expired {Math.abs(days!)} days ago</p>
            ) : urgent ? (
              <p className="text-lg font-bold text-amber-700 mt-1">Expires in {days} day{days !== 1 ? "s" : ""}</p>
            ) : (
              <p className="text-lg font-bold text-green-700 mt-1">{days} days remaining</p>
            )}
            {user.subscription_expires_at && (
              <p className="text-xs text-stone mt-0.5">Renews: {new Date(user.subscription_expires_at).toLocaleDateString()}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-ink">{user.monthly_fee ? `${Number(user.monthly_fee).toLocaleString()} MAD` : "—"}</p>
            <p className="text-xs text-stone">per month</p>
          </div>
        </div>

        {/* Progress bar */}
        {days !== null && days > 0 && days <= 31 && (
          <div className="mt-4">
            <div className="h-1.5 bg-stone/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${Math.min(100, (days / 31) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-stone mt-1">{days} / 31 days left</p>
          </div>
        )}
      </div>

      {/* Update form */}
      <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border border-stone/10 p-5">
        <h3 className="font-semibold text-sm text-ink">Update subscription</h3>
        {msg && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{msg}</p>}
        <div>
          <label className={lbl}>Next payment date *</label>
          <input type="date" className={inp} value={form.subscription_expires_at} onChange={e => setForm(p => ({ ...p, subscription_expires_at: e.target.value }))} required />
        </div>
        <div>
          <label className={lbl}>Monthly fee (MAD)</label>
          <input type="number" step="0.01" min="0" className={inp} value={form.monthly_fee} onChange={e => setForm(p => ({ ...p, monthly_fee: e.target.value }))} placeholder="100" />
        </div>
        <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold-deep hover:text-white transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Save subscription"}
        </button>
      </form>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AccountDetailPage({ params }: { params: Promise<{ userId: string; locale: string }> }) {
  const { userId } = use(params);
  const [data, setData] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    api.get(`/admin/managed-sellers/${userId}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <p className="text-stone">Account not found.</p>;

  const { user, seller, orders, products, conversations } = data;
  const logoUrl = getImageUrl(seller?.logo_path ?? undefined);
  const bannerUrl = getImageUrl(seller?.banner_path ?? undefined);
  const days = daysUntil(user.subscription_expires_at);
  const subExpired = days !== null && days < 0;
  const subUrgent  = days !== null && days >= 0 && days <= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Back ── */}
      <Link href="/admin/managed-sellers" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-ink transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Managed accounts
      </Link>

      {/* ── Profile header ── */}
      <div className="relative bg-white rounded-2xl border border-stone/10 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-sand to-stone/10 relative">
          {bannerUrl && <Image src={bannerUrl} alt="" fill className="object-cover" />}
          {/* Subscription badge */}
          <div className="absolute top-3 right-3">
            {subExpired ? (
              <span className="bg-henna text-white text-xs font-bold px-3 py-1 rounded-full">EXPIRED</span>
            ) : subUrgent ? (
              <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">Expires in {days}d</span>
            ) : user.subscription_expires_at ? (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">{days}d left</span>
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gold/10 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
              {logoUrl ? <Image src={logoUrl} alt={user.name} width={64} height={64} className="object-cover w-full h-full" /> : <span className="text-xl font-bold text-gold-deep">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1 min-w-0 pt-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl text-ink">{user.name}</h1>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${user.plan === "premium" ? "bg-ink/10 text-ink" : "bg-gold/15 text-gold-deep"}`}>{user.plan}</span>
                {seller && <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${seller.status === "verified" ? "bg-green-50 text-green-700" : "bg-henna/10 text-henna"}`}>{seller.status}</span>}
              </div>
              <p className="text-sm text-stone">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
              {seller && <p className="text-sm font-medium text-gold-deep mt-0.5">{seller.store_name}</p>}
            </div>
          </div>

          {/* Stats strip */}
          {seller && (
            <div className="flex gap-4 flex-wrap">
              {[
                { v: orders?.length ?? 0, l: "orders" },
                { v: products?.length ?? 0, l: "products" },
                { v: conversations?.filter(c => c.unread_count > 0).length ?? 0, l: "unread convos" },
                { v: orders?.filter(o => o.status === "pending").length ?? 0, l: "pending" },
              ].map(s => (
                <div key={s.l} className="text-center px-4 py-2 bg-sand rounded-xl border border-stone/10">
                  <p className="text-lg font-bold text-ink">{s.v}</p>
                  <p className="text-[10px] text-stone uppercase tracking-wide">{s.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white rounded-xl border border-stone/10 p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${tab === t ? "bg-gold text-ink" : "text-stone hover:text-ink"}`}>
            {t}
            {t === "Orders" && orders?.filter(o => o.status === "pending").length > 0 && (
              <span className="ms-1.5 text-[10px] bg-amber-400 text-white rounded-full px-1.5 py-0.5">{orders.filter(o => o.status === "pending").length}</span>
            )}
            {t === "Messages" && conversations?.reduce((a, c) => a + c.unread_count, 0) > 0 && (
              <span className="ms-1.5 text-[10px] bg-violet-500 text-white rounded-full px-1.5 py-0.5">{conversations.reduce((a, c) => a + c.unread_count, 0)}</span>
            )}
            {t === "Subscription" && (subExpired || subUrgent) && (
              <span className="ms-1.5 text-[10px] bg-henna text-white rounded-full px-1.5 py-0.5">!</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div>
        {/* OVERVIEW */}
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-stone/10 p-5 space-y-3">
              <h3 className="font-semibold text-sm text-ink">Store info</h3>
              {!seller ? (
                <p className="text-sm text-stone italic">No store created yet.</p>
              ) : (
                <dl className="space-y-2 text-sm">
                  {[["Store name", seller.store_name], ["Phone", seller.phone_number ?? "—"], ["Bank", seller.bank_name ?? "—"], ["Account", seller.bank_account_number ?? "—"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-2"><dt className="text-stone">{l}</dt><dd className="text-ink font-medium text-right">{v}</dd></div>
                  ))}
                  {seller.store_description && <div><dt className="text-stone mb-1">Description</dt><dd className="text-ink text-xs">{seller.store_description}</dd></div>}
                </dl>
              )}
            </div>
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-stone/10 p-5 space-y-3">
              <h3 className="font-semibold text-sm text-ink">Recent orders</h3>
              {!orders?.length ? <p className="text-sm text-stone italic">No orders yet.</p> : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-ink truncate">{o.customer?.name ?? "—"}</p><p className="text-[10px] text-stone">{timeAgo(o.created_at)}</p></div>
                      <OrderStatusBadge status={o.status} />
                      <span className="text-xs font-semibold text-ink shrink-0">{Number(o.total_price).toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === "Orders" && (
          <div className="bg-white rounded-2xl border border-stone/10 overflow-hidden">
            {!orders?.length ? <p className="text-sm text-stone italic p-6">No orders yet.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stone/10 text-[10px] uppercase tracking-wider text-stone">
                  <th className="text-left px-4 py-3">Customer</th><th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Amount</th><th className="text-right px-4 py-3">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-stone/10">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-sand/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{o.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold">{Number(o.total_price).toLocaleString()} MAD</td>
                      <td className="px-4 py-3 text-right text-stone text-xs">{timeAgo(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "Messages" && (
          <div className="space-y-2">
            {!conversations?.length ? <p className="text-sm text-stone italic">No conversations yet.</p> : conversations.map(c => {
              const av = getImageUrl(c.buyer?.avatar_path ?? undefined);
              return (
                <Link key={c.id} href={`/admin/conversations/${c.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-stone/10 px-4 py-3 hover:border-gold/30 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gold/10 border border-gold/20 shrink-0 flex items-center justify-center">
                    {av ? <Image src={av} alt="" width={36} height={36} className="object-cover w-full h-full" /> : <span className="text-xs font-bold text-gold-deep">{(c.buyer?.name ?? "?").charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{c.buyer?.name ?? "Unknown"}</p>
                    {c.product && <p className="text-xs text-stone truncate">{c.product.name}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.unread_count > 0 && <span className="text-[10px] font-bold bg-violet-500 text-white rounded-full px-1.5 py-0.5">{c.unread_count}</span>}
                    <span className="text-[10px] text-stone">{timeAgo(c.last_message_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "Products" && (
          <div className="space-y-4">
            {user.plan === "premium" && (
              <div className="flex justify-end">
                <Link href={`/admin/managed-sellers`} className="text-xs px-3 py-1.5 rounded-lg bg-ink text-white hover:bg-ink/80 transition-colors">+ Add Product</Link>
              </div>
            )}
            {!products?.length ? <p className="text-sm text-stone italic">No products yet.</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map(p => {
                  const imgUrl = getImageUrl(p.primary_image?.image_path);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-stone/10 overflow-hidden">
                      <div className="aspect-square bg-sand relative">
                        {imgUrl ? <Image src={imgUrl} alt={p.name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-stone/30"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {!p.is_approved && <span className="text-[9px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">Pending</span>}
                          {!p.is_active && <span className="text-[9px] bg-stone text-white px-1.5 py-0.5 rounded-full font-bold">Hidden</span>}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-ink line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gold-deep font-bold mt-1">{Number(p.price).toLocaleString()} MAD</p>
                        <p className="text-[10px] text-stone mt-0.5">Stock: {p.stock_quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab === "Subscription" && (
          <SubscriptionPanel user={user} onUpdated={u => setData(d => d ? { ...d, user: u } : d)} />
        )}
      </div>
    </div>
  );
}
