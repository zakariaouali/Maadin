"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import { Alert, Button, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";
import { getImageUrl } from "@/lib/image";
import Image from "next/image";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
  product?: { slug: string; primary_image?: { image_path: string } | null } | null;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_address: string;
  shipping_city: string;
  phone: string;
  notes?: string;
  tracking_number?: string;
  created_at: string;
  items: OrderItem[];
  customer?: { name: string; email: string };
}

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function SellerOrderDetailPage() {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    api.get(`/seller/orders/${id}`)
      .then((r) => {
        setOrder(r.data);
        setNewStatus(r.data.status);
        setTracking(r.data.tracking_number ?? "");
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const r = await api.put(`/seller/orders/${order.id}/status`, {
        status: newStatus,
        tracking_number: tracking || undefined,
      });
      setOrder(r.data);
      setSaveMsg(t("statusUpdated"));
    } catch (err: any) {
      setSaveMsg(err.response?.data?.message ?? t("failedUpdateStatus"));
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error || !order) return <Alert type="error">{error || "Order not found."}</Alert>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/seller/orders" className="text-stone hover:text-ink transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <PageHeader title={`${t("orderDetail")} #${order.order_number}`} />
      </div>

      {saveMsg && (
        <Alert type={saveMsg === t("statusUpdated") ? "success" : "error"}>{saveMsg}</Alert>
      )}

      {/* Current status */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 space-y-1">
        <OrderStatusBadge status={order.status} />
        <p className="text-xs text-stone">
          {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone/10">
          <h2 className="text-sm font-semibold text-ink">{t("orderItems")}</h2>
        </div>
        <ul className="divide-y divide-stone/10">
          {order.items.map((item) => {
            const img = getImageUrl(item.product?.primary_image?.image_path);
            return (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-14 rounded-sm bg-sand overflow-hidden shrink-0">
                  {img ? (
                    <Image src={img} alt={item.product_name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-sand-dark" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-stone">×{item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-ink shrink-0">
                  {(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)} MAD
                </p>
              </li>
            );
          })}
        </ul>
        <div className="px-5 py-3 border-t border-stone/10 flex justify-between">
          <span className="text-sm text-stone">Total</span>
          <span className="font-semibold text-ink">{parseFloat(order.total_price).toFixed(2)} MAD</span>
        </div>
      </div>

      {/* Buyer info */}
      {order.customer && (
        <div className="bg-white border border-stone/20 rounded-sm p-5 space-y-2">
          <h2 className="text-sm font-semibold text-ink">{t("buyerInfo")}</h2>
          <p className="text-sm text-ink">{order.customer.name}</p>
          <p className="text-sm text-stone">{order.customer.email}</p>
          <p className="text-sm text-stone">{order.phone}</p>
          <p className="text-sm text-stone">{order.shipping_address}, {order.shipping_city}</p>
          {order.notes && <p className="text-sm text-stone italic">{order.notes}</p>}
        </div>
      )}

      {/* Update status */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">{t("updateOrderStatus")}</h2>
        <form onSubmit={updateStatus} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone uppercase tracking-wide">{t("updateStatus")}</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`status${s.charAt(0).toUpperCase() + s.slice(1)}` as any)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-stone uppercase tracking-wide">{t("tracking")}</label>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="optional"
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
            />
          </div>
          <Button type="submit" variant="primary" loading={saving}>
            {tCommon("save")}
          </Button>
        </form>
      </div>
    </div>
  );
}
