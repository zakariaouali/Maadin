"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Button, EmptyState, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
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

  return (
    <div className="max-w-3xl">
      <PageHeader title={t("incomingOrders")} />

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
              <div key={order.id} className="bg-white border border-stone/20 rounded-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-sand border-b border-stone/10">
                  <div>
                    <span className="font-mono text-sm font-medium text-ink">{order.order_number}</span>
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
                      <div key={item.id} className="flex justify-between items-center px-3 py-2 text-sm">
                        <span className="text-ink">
                          {item.product_name} <span className="text-stone">×{item.quantity}</span>
                        </span>
                        <span className="text-stone">{item.price_at_purchase} MAD</span>
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
