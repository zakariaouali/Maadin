"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Button, Modal, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: string; }
interface Order {
  id: number; status: string; total_price: string; shipping_address: string;
  created_at: string; tracking_number?: string;
  customer?: { name: string; email: string; phone?: string };
  seller?: { store_name: string };
  items?: OrderItem[];
}
type Tab = "all"|"pending"|"confirmed"|"shipped"|"delivered"|"cancelled";

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [detail, setDetail] = useState<Order|null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (tb: Tab) => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (tb !== "all") p.status = tb;
    try { const { data } = await api.get("/admin/orders",{params:p}); setOrders(data.data??data); }
    catch { setError("Failed to load."); }
    setLoading(false);
  };

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setDetail({id,status:"",total_price:"0",shipping_address:"",created_at:""});
    try { const { data } = await api.get(`/admin/orders/${id}`); setDetail(data); } catch {}
    setDetailLoading(false);
  };

  useEffect(() => { load("all"); }, []);

  const tabs: {key:Tab;label:string}[] = [
    {key:"all",label:t("all")},{key:"pending",label:t("pending")},{key:"confirmed",label:"Confirmed"},
    {key:"shipped",label:"Shipped"},{key:"delivered",label:"Delivered"},{key:"cancelled",label:"Cancelled"},
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
                </div>
                <p className="text-xs text-stone truncate">{o.customer?.name ?? "?"} to {o.seller?.store_name ?? "?"}</p>
                <p className="text-xs text-stone/60">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-semibold text-ink shrink-0 hidden sm:block">{Number(o.total_price).toLocaleString()} MAD</span>
              <Button size="sm" variant="secondary" onClick={() => openDetail(o.id)}>{t("view")}</Button>
            </div>
          ))}
        </div>
      )}
      <Modal open={detail!==null} onClose={() => setDetail(null)}
        title={detail ? `Order #${detail.id}` : "..."} maxWidth="max-w-lg">
        {detailLoading ? <div className="flex justify-center py-8"><Spinner /></div>
        : detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-stone">{t("customer")}</p><p className="font-medium">{detail.customer?.name}</p><p className="text-xs text-stone">{detail.customer?.email}</p></div>
              <div><p className="text-xs text-stone">{t("seller")}</p><p className="font-medium">{detail.seller?.store_name}</p></div>
              <div><p className="text-xs text-stone">Status</p><OrderStatusBadge status={detail.status} /></div>
              <div><p className="text-xs text-stone">{t("amount")}</p><p className="font-semibold">{Number(detail.total_price).toLocaleString()} MAD</p></div>
              {detail.tracking_number && <div className="col-span-2"><p className="text-xs text-stone">Tracking</p><p className="font-mono">{detail.tracking_number}</p></div>}
              <div className="col-span-2"><p className="text-xs text-stone">{t("shippingAddress")}</p><p className="text-stone">{detail.shipping_address}</p></div>
            </div>
            {(detail.items??[]).length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">{t("orderItems")}</p>
                <div className="divide-y divide-stone/10 border border-stone/20 rounded-sm">
                  {(detail.items??[]).map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                      <p className="flex-1 text-sm">{item.product_name}</p>
                      <span className="text-xs text-stone">{t("qty")}: {item.quantity}</span>
                      <span className="text-sm font-medium">{Number(item.unit_price).toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
