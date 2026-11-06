"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api, { apiErrorMessage } from "@/lib/api";
import { Alert, Badge, Button, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";
import { PlanName, RoleName } from "@/components/ui/RoleName";
import { formatDate, formatDateTime, formatPrice } from "@/lib/i18n-helpers";
import { useAuditLabels } from "@/components/admin/auditLabels";

interface UserDetail {
  id: number; name: string; email: string; phone: string | null;
  role: string; plan: string; status: string; locale?: string;
  created_at: string; last_login_at: string | null;
  seller: { id: number; store_name: string; store_slug: string; status: string } | null;
  stats: {
    orders_count: number; delivered_total: number; reviews_count: number; addresses_count: number;
    products_count: number; store_orders_count: number;
  };
  recent_orders: { id: number; order_number: string; status: string; on_hold: boolean; total_price: string; created_at: string }[];
  history: { id: number; action: string; admin: string | null; changes: Record<string, unknown> | null; at: string | null }[];
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = { active: "success", suspended: "warning", banned: "danger" };

export default function AdminUserDetailPage() {
  const t = useTranslations("admin");
  const tu = useTranslations("ui");
  const label = useAuditLabels();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"suspended" | "banned" | null>(null);

  useEffect(() => {
    let alive = true;
    api.get(`/admin/users/${id}`)
      .then(({ data }) => { if (alive) { setUser(data); setError(""); } })
      .catch((e) => { if (alive) setError(apiErrorMessage(e, tu("failedLoad"))); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, version, tu]);

  const setStatus = async (status: "active" | "suspended" | "banned") => {
    setBusy(true); setError(""); setNotice("");
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      setConfirm(null);
      setNotice(t("statusUpdated"));
      setVersion((v) => v + 1);
    } catch (e) {
      setError(apiErrorMessage(e, t("failedAction")));
    }
    setBusy(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!user) return <Alert type="error">{error || tu("failedLoad")}</Alert>;

  const isAdmin = user.role === "admin";
  const card = "bg-white border border-stone/20 rounded-sm";
  const stats = [
    { v: user.stats.orders_count, l: tu("statOrders") },
    { v: formatPrice(user.stats.delivered_total), l: t("deliveredTotal") },
    { v: user.stats.reviews_count, l: t("statReviews") },
    { v: user.stats.addresses_count, l: t("statAddresses") },
    ...(user.seller ? [{ v: user.stats.products_count, l: t("statProducts") }, { v: user.stats.store_orders_count, l: t("statStoreOrders") }] : []),
  ];

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-stone hover:text-ink transition-colors" aria-label={t("backToUsers")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <PageHeader title={user.name} />
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {/* Who */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={user.role === "seller" ? "gold" : "default"}><RoleName role={user.role} /></Badge>
          <Badge variant={STATUS_VARIANT[user.status] ?? "default"}>{user.status}</Badge>
          {user.seller && <Badge variant="info"><PlanName plan={user.plan} /></Badge>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <p><span className="text-stone">{t("email")}: </span><span className="text-ink break-all">{user.email}</span></p>
          <p><span className="text-stone">{t("phone")}: </span><span className="text-ink" dir="ltr">{user.phone ?? "—"}</span></p>
          <p><span className="text-stone">{t("joined")}: </span><span className="text-ink">{formatDate(user.created_at)}</span></p>
          <p><span className="text-stone">{t("lastLogin")}: </span><span className="text-ink">{user.last_login_at ? formatDateTime(user.last_login_at) : "—"}</span></p>
        </div>

        {!isAdmin && (
          <div className="border-t border-stone/10 pt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {user.status !== "active" && <Button loading={busy} onClick={() => setStatus("active")}>{t("activate")}</Button>}
              {user.status === "active" && <Button variant="secondary" disabled={busy} onClick={() => setConfirm("suspended")}>{t("suspend")}</Button>}
              {user.status !== "banned" && <Button variant="danger" disabled={busy} onClick={() => setConfirm("banned")}>{t("ban")}</Button>}
            </div>
            {confirm && (
              <div className="rounded-sm border border-red-200 bg-red-50 p-3 space-y-2">
                <p className="text-sm text-red-900">{confirm === "banned" ? t("banConfirm") : t("suspendConfirm")}</p>
                <div className="flex gap-2">
                  <Button variant="danger" loading={busy} onClick={() => setStatus(confirm)}>{t("confirmYes")}</Button>
                  <Button variant="secondary" disabled={busy} onClick={() => setConfirm(null)}>{t("cancel")}</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.l} className={`${card} p-4 text-center`}>
            <p className="text-lg font-semibold text-ink">{s.v}</p>
            <p className="text-xs text-stone mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Store */}
      {user.seller && (
        <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className="text-xs text-stone">{t("storeLabel")}</p>
            <p className="font-medium text-ink">{user.seller.store_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.seller.status === "verified" ? "success" : "warning"}>{user.seller.status}</Badge>
            {(user.plan === "managed" || user.plan === "premium") && (
              <Link href={`/admin/managed-sellers/${user.id}`} className="text-sm text-gold-deep hover:underline">{t("openStore")}</Link>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className={card}>
        <div className="px-5 py-3 border-b border-stone/10"><h2 className="text-sm font-semibold text-ink">{t("recentOrders")}</h2></div>
        {user.recent_orders.length === 0 ? (
          <p className="p-5 text-sm text-stone">{t("noOrdersYet")}</p>
        ) : (
          <ul className="divide-y divide-stone/10">
            {user.recent_orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="font-mono text-xs text-stone">{o.order_number}</span>
                <OrderStatusBadge status={o.status} />
                {o.on_hold && <Badge variant="warning">{t("ordOnHold")}</Badge>}
                <span className="ms-auto text-xs text-stone">{formatDate(o.created_at)}</span>
                <span className="font-medium text-ink">{formatPrice(o.total_price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* What the team did */}
      <div className={card}>
        <div className="px-5 py-3 border-b border-stone/10"><h2 className="text-sm font-semibold text-ink">{t("accountHistory")}</h2></div>
        {user.history.length === 0 ? (
          <p className="p-5 text-sm text-stone">{t("noHistory")}</p>
        ) : (
          <ul className="divide-y divide-stone/10">
            {user.history.map((h) => (
              <li key={h.id} className="px-5 py-3 text-sm">
                <p className="text-ink">{label.action(h.action)}{label.changes(h.changes) ? ` — ${label.changes(h.changes)}` : ""}</p>
                <p className="text-xs text-stone">{h.admin ? t("ordBy", { name: h.admin }) : ""}{h.at ? ` · ${formatDateTime(h.at)}` : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
