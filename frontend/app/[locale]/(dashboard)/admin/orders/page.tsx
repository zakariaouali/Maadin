"use client";

import { useEffect, useState } from "react";
import { Pager } from "@/components/ui/Pager";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Badge, Button, Modal, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/i18n-helpers";
import { OrderPanel } from "@/components/admin/OrderPanel";

interface Order {
  id: number; order_number?: string; status: string; on_hold?: boolean; is_managed?: boolean;
  total_price: string; created_at: string;
  customer?: { name: string; email: string };
  seller?: { store_name: string };
}
type Tab = "all"|"hold"|"pending"|"confirmed"|"shipped"|"delivered"|"cancelled";

export default function AdminOrdersPage() {
  const tu = useTranslations("ui");
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [pg, setPg] = useState({ page: 1, last: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<number|null>(null);
  const [error, setError] = useState("");

  const load = async (tb: Tab, page = 1) => {
    setLoading(true);
    const p: Record<string,string> = {};
    p.page = String(page);
    if (tb === "hold") p.on_hold = "1";
    else if (tb !== "all") p.status = tb;
    try { const { data } = await api.get("/admin/orders",{params:p}); setOrders(data.data??data); setPg({ page: data.current_page ?? 1, last: data.last_page ?? 1, total: data.total ?? 0 }); }
    catch { setError(tu("failedLoad")); }
    setLoading(false);
  };

  useEffect(() => { load("all"); }, []);

  const tabs: {key:Tab;label:string}[] = [
    {key:"all",label:t("all")},{key:"hold",label:t("ordOnHold")},{key:"pending",label:t("pending")},{key:"confirmed",label:tu("statusConfirmed")},
    {key:"shipped",label:tu("statusShipped")},{key:"delivered",label:tu("statusDelivered")},{key:"cancelled",label:tu("statusCancelled")},
  ];
  const cls = (a: boolean) => "px-3 py-1.5 rounded-sm text-sm transition-colors " + (a ? "bg-white text-ink shadow-sm font-medium" : "text-stone hover:text-ink");

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader title={t("orders")} />
      {error && <Alert type="error">{error}</Alert>}
      <div className="flex gap-1 bg-sand rounded-sm p-1 w-fit flex-wrap">
        {tabs.map(tb => <button key={tb.key} onClick={() => { setTab(tb.key); load(tb.key); }} className={cls(tab===tb.key)}>{tb.label}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      : orders.length===0 ? <p className="text-stone text-sm py-8 text-center">{t("noOrders")}</p>
      : (
        <div className="bg-white border border-stone/20 rounded-sm divide-y divide-stone/10">
          {orders.map(o => (
            <div key={o.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">#{o.id}</span>
                  <OrderStatusBadge status={o.status} />
                  {o.on_hold && <Badge variant="warning">{t("ordOnHold")}</Badge>}
                </div>
                <p className="text-xs text-stone truncate">{o.customer?.name ?? "?"} to {o.seller?.store_name ?? "?"}</p>
                <p className="text-xs text-stone/60">{formatDate(o.created_at)}</p>
              </div>
              <span className="text-sm font-semibold text-ink shrink-0 hidden sm:block">{formatPrice(o.total_price)}</span>
              <Button size="sm" variant="secondary" onClick={() => setOpenId(o.id)}>{o.is_managed ? t("ordProcess") : t("view")}</Button>
            </div>
          ))}
        </div>
      )}
      <Pager page={pg.page} lastPage={pg.last} total={pg.total} onChange={(p) => load(tab, p)} />
      <Modal open={openId!==null} onClose={() => setOpenId(null)}
        title={openId ? t("ordTitle", { id: openId }) : "..."} maxWidth="max-w-xl">
        {openId !== null && <OrderPanel key={openId} orderId={openId} onChanged={() => load(tab, pg.page)} />}
      </Modal>
    </div>
  );
}
