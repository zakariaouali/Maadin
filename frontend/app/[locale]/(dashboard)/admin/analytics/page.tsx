"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/lib/api";
import { Spinner, OrderStatusBadge } from "@/components/ui";
import { getImageUrl } from "@/lib/image";
import Image from "next/image";

interface Dashboard {
  total_users: number; total_customers: number; total_sellers: number;
  pending_sellers: number; verified_sellers: number;
  total_products: number; active_products: number; pending_products: number;
  total_orders: number; pending_orders: number; processing_orders: number; delivered_orders: number; total_revenue: number;
  unread_messages: number;
  revenue_by_month: { month: string; total: string }[];
  orders_by_status: { status: string; count: number }[];
  recent_orders: { id: number; status: string; total_price: string; created_at: string; customer: { name: string }; seller: { store_name: string } }[];
  recent_conversations: { id: number; unread_count: number; last_message_at: string; buyer: { name: string; avatar_path: string | null }; product: { name: string } | null }[];
  top_sellers: { id: number; store_name: string; store_slug: string; orders_count: number; orders_sum_total_price: string | null }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", shipped: "#c9a227",
  delivered: "#22c55e", cancelled: "#8c2f1b",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics/dashboard")
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!data) return null;

  const urgentItems = [
    { count: data.pending_sellers, label: "Sellers to verify", sub: "Waiting for review", href: "/admin/sellers", color: "amber", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { count: data.pending_products, label: "Products to approve", sub: "Waiting for review", href: "/admin/products", color: "amber", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { count: data.processing_orders, label: "Orders to handle", sub: "Pending + confirmed", href: "/admin/orders", color: "blue", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { count: data.unread_messages, label: "Unread messages", sub: "Across all conversations", href: "/admin/conversations", color: "purple", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; num: string; dot: string }> = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", num: "text-amber-800", dot: "bg-amber-400" },
    blue:  { bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-700",  num: "text-blue-800",  dot: "bg-blue-400"  },
    purple:{ bg: "bg-violet-50",border: "border-violet-200",text: "text-violet-700",num: "text-violet-800",dot: "bg-violet-400"},
  };

  const revenueData = data.revenue_by_month.map(r => ({ month: r.month.slice(5), revenue: parseFloat(r.total) }));
  const pieData = data.orders_by_status.map(o => ({ name: o.status, value: Number(o.count), color: STATUS_COLORS[o.status] ?? "#8b8378" }));
  const totalUrgent = data.pending_sellers + data.pending_products + data.processing_orders + data.unread_messages;

  return (
    <div className="max-w-5xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Operations Dashboard</h1>
          <p className="text-sm text-stone mt-0.5">
            {totalUrgent > 0
              ? <span className="text-amber-600 font-medium">{totalUrgent} items need your attention</span>
              : <span className="text-green-600 font-medium">All clear — nothing urgent right now</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-ink">{Number(data.total_revenue).toLocaleString()} <span className="text-sm font-normal text-stone">MAD</span></p>
          <p className="text-xs text-stone">total revenue</p>
        </div>
      </div>

      {/* ── Urgent action cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {urgentItems.map(item => {
          const c = colorMap[item.color] ?? colorMap.amber;
          const hasItems = item.count > 0;
          return (
            <Link key={item.label} href={item.href}
              className={`relative flex flex-col gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${
                hasItems ? `${c.bg} ${c.border}` : "bg-white border-stone/10 hover:border-stone/20"
              }`}
            >
              {hasItems && (
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
              )}
              <div className={hasItems ? c.text : "text-stone"}>{item.icon}</div>
              <div>
                <p className={`text-3xl font-bold ${hasItems ? c.num : "text-ink"}`}>{item.count}</p>
                <p className={`text-xs font-semibold mt-0.5 ${hasItems ? c.text : "text-stone"}`}>{item.label}</p>
                <p className="text-[10px] text-stone mt-0.5">{item.sub}</p>
              </div>
              <p className={`text-[10px] font-medium mt-auto ${hasItems ? c.text : "text-stone/60"}`}>
                {hasItems ? "Review →" : "All done ✓"}
              </p>
            </Link>
          );
        })}
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total users", value: data.total_users, sub: `${data.total_customers} customers · ${data.total_sellers} sellers` },
          { label: "Active products", value: data.active_products, sub: `${data.total_products} total` },
          { label: "Total orders", value: data.total_orders, sub: `${data.delivered_orders} delivered` },
          { label: "Verified sellers", value: data.verified_sellers, sub: `${data.pending_sellers} pending` },
        ].map(k => (
          <div key={k.label} className="bg-white border border-stone/10 rounded-xl p-4">
            <p className="text-xs text-stone uppercase tracking-wide">{k.label}</p>
            <p className="text-2xl font-semibold text-ink mt-1">{k.value}</p>
            <p className="text-[11px] text-stone mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content: 2 column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border border-stone/10 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-ink mb-4">Revenue — last 6 months</h3>
          {revenueData.length === 0
            ? <p className="text-sm text-stone text-center py-10">No revenue data yet.</p>
            : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a227" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8b8378" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8b8378" }} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} MAD`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#c9a227" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Orders by status */}
        <div className="bg-white border border-stone/10 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-ink mb-4">Orders by status</h3>
          {pieData.length === 0
            ? <p className="text-sm text-stone text-center py-10">No orders yet.</p>
            : <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map(o => (
                    <div key={o.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: o.color }} />
                        <span className="capitalize text-stone">{o.name}</span>
                      </span>
                      <span className="font-semibold text-ink">{o.value}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </div>
      </div>

      {/* ── Bottom: recent orders + messages ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent orders */}
        <div className="bg-white border border-stone/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-ink">Recent orders</h3>
            <Link href="/admin/orders" className="text-xs text-gold-deep hover:underline">View all →</Link>
          </div>
          {data.recent_orders.length === 0
            ? <p className="text-sm text-stone text-center py-6">No orders yet.</p>
            : <div className="divide-y divide-stone/10">
                {data.recent_orders.map(o => (
                  <div key={o.id} className="py-2.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{o.customer?.name ?? "—"}</p>
                      <p className="text-[11px] text-stone truncate">{o.seller?.store_name ?? "—"}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-xs font-semibold text-ink shrink-0">{Number(o.total_price).toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Recent conversations */}
        <div className="bg-white border border-stone/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-ink">Recent conversations</h3>
            <Link href="/admin/conversations" className="text-xs text-gold-deep hover:underline">View all →</Link>
          </div>
          {data.recent_conversations.length === 0
            ? <p className="text-sm text-stone text-center py-6">No conversations yet.</p>
            : <div className="divide-y divide-stone/10">
                {data.recent_conversations.map(c => {
                  const avatarUrl = getImageUrl(c.buyer?.avatar_path ?? undefined);
                  return (
                    <Link key={c.id} href={`/admin/conversations/${c.id}`} className="py-2.5 flex items-center gap-3 hover:bg-sand/30 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gold/10 border border-gold/20 shrink-0 flex items-center justify-center">
                        {avatarUrl
                          ? <Image src={avatarUrl} alt={c.buyer?.name ?? ""} width={32} height={32} className="object-cover w-full h-full" />
                          : <span className="text-xs font-bold text-gold-deep">{(c.buyer?.name ?? "?").charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">{c.buyer?.name ?? "Unknown"}</p>
                        {c.product && <p className="text-[11px] text-stone truncate">{c.product.name}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {c.unread_count > 0 && (
                          <span className="text-[10px] font-bold bg-violet-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                            {c.unread_count}
                          </span>
                        )}
                        <span className="text-[10px] text-stone">{timeAgo(c.last_message_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* ── Top sellers ── */}
      <div className="bg-white border border-stone/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-ink">Top sellers by revenue</h3>
          <Link href="/admin/sellers" className="text-xs text-gold-deep hover:underline">View all →</Link>
        </div>
        {data.top_sellers.length === 0
          ? <p className="text-sm text-stone text-center py-4">No sellers yet.</p>
          : <div className="grid grid-cols-5 gap-3">
              {data.top_sellers.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center text-center gap-1 p-3 rounded-xl border border-stone/10 hover:border-gold/30 transition-colors">
                  <span className="text-[10px] text-stone">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-gold-deep">{s.store_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="text-xs font-semibold text-ink line-clamp-1">{s.store_name}</p>
                  <p className="text-[10px] text-stone">{s.orders_count} orders</p>
                  <p className="text-xs font-semibold text-gold-deep">
                    {s.orders_sum_total_price ? `${Number(s.orders_sum_total_price).toLocaleString()}` : "—"} MAD
                  </p>
                </div>
              ))}
            </div>
        }
      </div>

    </div>
  );
}
