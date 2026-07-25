"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { Alert, Button, EmptyState, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";

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
  shipping_phone: string;
  tracking_number: string | null;
  created_at: string;
  items: OrderItem[];
  customer: { id: number; name: string; phone: string } | null;
}

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function SellerOrdersPage() {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [tracking, setTracking] = useState<Record<number, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/seller/orders");
      setOrders(data);
    } catch {
      setErrorMsg(t("failedLoadOrders"));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdating(orderId);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const { data } = await api.put(`/seller/orders/${orderId}/status`, {
        status,
        tracking_number: tracking[orderId] || undefined,
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
      setSuccessMsg(t("statusUpdated"));
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t("failedUpdateStatus"));
    }
    setUpdating(null);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="max-w-3xl">
      <PageHeader title={t("incomingOrders")} />

      {/* Urgent banner for pending orders */}
      {pendingOrders.length > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-sm px-5 py-4">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {pendingOrders.length === 1
                ? "You have 1 new order waiting for confirmation!"
                : `You have ${pendingOrders.length} new orders waiting for confirmation!`}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Confirm them below so customers know their order is being processed.
            </p>
          </div>
        </div>
      )}

      {successMsg && <Alert type="success" className="mb-6">{successMsg}</Alert>}
      {errorMsg && <Alert type="error" className="mb-6">{errorMsg}</Alert>}

      {orders.length === 0 ? (
        <EmptyState title={t("noOrders")} />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const nextStatuses = TRANSITIONS[order.status] ?? [];
            const isUpdating = updating === order.id;

            return (
              <div key={order.id} className={`bg-white rounded-sm overflow-hidden ${order.status === "pending" ? "border-2 border-amber-300 shadow-sm shadow-amber-100" : "border border-stone/20"}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${order.status === "pending" ? "bg-amber-50 border-amber-200" : "bg-sand border-stone/10"}`}>
                  <div>
                    <Link href={`/seller/orders/${order.id}`} className="font-mono text-sm font-medium text-ink hover:text-gold-deep transition-colors">{order.order_number}</Link>
                    <span className="text-xs text-stone ms-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                  {/* Customer */}
                  {order.customer && (
                    <div className="text-sm">
                      <span className="text-stone">{t("customer")}: </span>
                      <span className="text-ink font-medium">{order.customer.name}</span>
                      <span className="text-stone ms-2">· {order.shipping_phone}</span>
                    </div>
                  )}

                  {/* Address */}
                  <p className="text-xs text-stone">
                    {order.shipping_address}, {order.shipping_city}
                  </p>

                  {/* Items */}
                  <div className="divide-y divide-stone/10 border border-stone/15 rounded-sm">
                    {(order.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-sand border border-stone/10 shrink-0 flex items-center justify-center">
                          {item.product?.primary_image ? (
                            <Image src={getImageUrl(item.product.primary_image.image_path) ?? ""} alt={item.product_name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone/30"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          )}
                        </div>
                        <span className="flex-1 text-ink">
                          {item.product_name} <span className="text-stone">×{item.quantity}</span>
                        </span>
                        <span className="text-stone shrink-0">{item.price_at_purchase} MAD</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-ink">{order.total_price} MAD</span>
                  </div>

                  {/* Tracking input when about to ship */}
                  {order.status === "confirmed" && (
                    <input
                      type="text"
                      placeholder={t("tracking")}
                      value={tracking[order.id] ?? ""}
                      onChange={(e) => setTracking((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
                    />
                  )}

                  {/* Action buttons */}
                  {nextStatuses.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {nextStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === "cancelled" ? "danger" : "primary"}
                          loading={isUpdating}
                          onClick={() => updateStatus(order.id, status)}
                        >
                          {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as any)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
