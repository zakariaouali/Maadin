"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api, { apiErrorMessage } from "@/lib/api";
import { Alert, Badge, Button, OrderStatusBadge, Spinner } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/i18n-helpers";
import { telUrl, whatsappUrl } from "@/lib/phone";

interface OrderItem { id: number; product_name: string; quantity: number; price_at_purchase: string }
interface TimelineEntry {
  id: number; action: string; admin: string | null; at: string | null;
  changes: { from?: string; to?: string; reason?: string | null; tracking_number?: string | null; excerpt?: string } | null;
}
interface OrderDetail {
  id: number; order_number: string; status: string; on_hold: boolean; hold_reason: string | null;
  total_price: string; shipping_address: string; shipping_city: string; shipping_phone: string;
  notes: string | null; tracking_number: string | null; created_at: string; is_managed: boolean;
  customer: { name: string; email: string; phone: string | null } | null;
  seller: { store_name: string } | null;
  items: OrderItem[];
  timeline: TimelineEntry[];
}

/**
 * Everything the team needs to process an order for a managed store: details, contact,
 * status steps, hold, a message to the customer (sent as the store) and the history.
 */
export function OrderPanel({ orderId, onChanged }: { orderId: number; onChanged?: () => void }) {
  const t = useTranslations("admin");
  const tu = useTranslations("ui");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [tracking, setTracking] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState("");

  // Bumping this reloads the order from the server
  const [version, setVersion] = useState(0);
  const reload = () => setVersion((v) => v + 1);

  useEffect(() => {
    let alive = true;
    api.get(`/admin/orders/${orderId}`)
      .then(({ data }) => { if (alive) { setOrder(data); setError(""); } })
      .catch((e) => { if (alive) setError(apiErrorMessage(e, tu("failedLoadOrder"))); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [orderId, version, tu]);

  /** Run one action, then refresh the order with what the server answered */
  const run = async (action: () => Promise<{ data: OrderDetail | unknown }>, done?: string): Promise<boolean> => {
    setBusy(true); setError(""); setNotice("");
    let ok = true;
    try {
      const { data } = await action();
      if (data && typeof data === "object" && "timeline" in data) setOrder(data as OrderDetail);
      else reload();
      if (done) setNotice(done);
      onChanged?.();
    } catch (e) {
      setError(apiErrorMessage(e, t("failedAction")));
      ok = false;
    }
    setBusy(false);
    return ok;
  };

  const setStatus = (status: string) =>
    run(() => api.put(`/admin/orders/${orderId}/status`, { status, tracking_number: status === "shipped" && tracking ? tracking : undefined }))
      .then((ok) => { if (ok) { setConfirmCancel(false); setTracking(""); } });

  const setHold = (onHold: boolean) =>
    run(() => api.put(`/admin/orders/${orderId}/hold`, { on_hold: onHold, reason: onHold ? holdReason || null : null }))
      .then((ok) => { if (ok) setHoldReason(""); });

  const sendMessage = () => {
    if (!message.trim()) return;
    run(() => api.post(`/admin/orders/${orderId}/message`, { content: message }), t("ordSent")).then((ok) => { if (ok) setMessage(""); });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (!order) return error ? <Alert type="error">{error}</Alert> : null;

  const canAct = order.is_managed;
  const open = order.status !== "delivered" && order.status !== "cancelled";
  const phone = order.shipping_phone || order.customer?.phone || "";
  const wa = phone ? whatsappUrl(phone) : null;

  const logLine = (l: TimelineEntry) => {
    if (l.action === "order_status_changed") return t("ordLogStatus", { from: statusLabel(l.changes?.from), to: statusLabel(l.changes?.to) });
    if (l.action === "order_put_on_hold") return t("ordLogHold");
    if (l.action === "order_hold_released") return t("ordLogRelease");
    if (l.action === "order_message_sent") return t("ordLogMessage");
    return l.action;
  };
  function statusLabel(s?: string) {
    return s === "pending" ? t("pending") : s === "confirmed" ? tu("statusConfirmed") : s === "shipped" ? tu("statusShipped")
      : s === "delivered" ? tu("statusDelivered") : s === "cancelled" ? tu("statusCancelled") : (s ?? "");
  }
  const field = "w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep";

  return (
    <div className="space-y-5 text-sm">
      {error && <Alert type="error">{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-stone">{order.order_number}</span>
        <OrderStatusBadge status={order.status} />
        {order.on_hold && <Badge variant="warning">{t("ordOnHold")}</Badge>}
        <span className="ms-auto font-semibold text-ink">{formatPrice(order.total_price)}</span>
      </div>

      {order.on_hold && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          <p className="font-medium">{t("ordOnHold")}{order.hold_reason ? ` — ${order.hold_reason}` : ""}</p>
          <p className="text-xs mt-0.5">{t("ordHoldBlocks")}</p>
        </div>
      )}

      {!canAct && <Alert type="info">{t("ordNotManaged")}</Alert>}

      {/* Customer and delivery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-stone">{t("customer")}</p>
          <p className="font-medium">{order.customer?.name ?? "—"}</p>
          <p className="text-xs text-stone break-all">{order.customer?.email}</p>
        </div>
        <div>
          <p className="text-xs text-stone">{t("seller")}</p>
          <p className="font-medium">{order.seller?.store_name ?? "—"}</p>
          <p className="text-xs text-stone">{formatDate(order.created_at)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-stone">{t("shippingAddress")}</p>
          <p dir="auto">{order.shipping_address}, {order.shipping_city}</p>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs text-stone">{t("ordNotes")}</p>
            <p dir="auto" className="whitespace-pre-line">{order.notes}</p>
          </div>
        )}
        {order.tracking_number && (
          <div className="sm:col-span-2">
            <p className="text-xs text-stone">{tu("tracking")}</p>
            <p className="font-mono">{order.tracking_number}</p>
          </div>
        )}
      </div>

      {/* Call / WhatsApp */}
      {phone && (
        <div className="rounded-sm border border-stone/20 p-3">
          <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">{t("ordContact")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium" dir="ltr">{phone}</span>
            <a href={telUrl(phone)} className="inline-flex min-h-[44px] items-center rounded-sm border border-stone/30 px-4 text-sm font-medium hover:border-gold-deep">{t("ordCall")}</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center rounded-sm border border-green-600/40 bg-green-50 px-4 text-sm font-medium text-green-800 hover:border-green-700">{t("ordWhatsapp")}</a>}
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">{t("orderItems")}</p>
        <div className="divide-y divide-stone/10 border border-stone/20 rounded-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              <p className="flex-1">{item.product_name}</p>
              <span className="text-xs text-stone">{t("qty")}: {item.quantity}</span>
              <span className="font-medium">{formatPrice(item.price_at_purchase)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {canAct && open && (
        <div className="space-y-3 rounded-sm border border-stone/20 p-3">
          <p className="text-xs font-medium text-stone uppercase tracking-wide">{t("ordActions")}</p>

          {order.status === "confirmed" && !order.on_hold && (
            <div>
              <label htmlFor="trk" className="text-xs text-stone block mb-1">{t("ordTrackingLabel")}</label>
              <input id="trk" className={field} value={tracking} maxLength={100} onChange={(e) => setTracking(e.target.value)} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {order.status === "pending" && <Button loading={busy} disabled={order.on_hold} onClick={() => setStatus("confirmed")}>{t("ordConfirm")}</Button>}
            {order.status === "confirmed" && <Button loading={busy} disabled={order.on_hold} onClick={() => setStatus("shipped")}>{t("ordShip")}</Button>}
            {order.status === "shipped" && <Button loading={busy} disabled={order.on_hold} onClick={() => setStatus("delivered")}>{t("ordDeliver")}</Button>}
            {!confirmCancel && <Button variant="danger" disabled={busy} onClick={() => setConfirmCancel(true)}>{t("ordCancel")}</Button>}
          </div>

          {confirmCancel && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-red-900">{t("ordCancelSure")}</p>
              <div className="flex gap-2">
                <Button variant="danger" loading={busy} onClick={() => setStatus("cancelled")}>{t("ordCancelYes")}</Button>
                <Button variant="secondary" disabled={busy} onClick={() => setConfirmCancel(false)}>{t("ordKeep")}</Button>
              </div>
            </div>
          )}

          {/* Hold */}
          <div className="border-t border-stone/10 pt-3">
            {order.on_hold ? (
              <Button variant="secondary" loading={busy} onClick={() => setHold(false)}>{t("ordReleaseHold")}</Button>
            ) : (
              <div className="space-y-2">
                <label htmlFor="hold" className="text-xs text-stone block">{t("ordHoldReasonLabel")}</label>
                <input id="hold" className={field} value={holdReason} maxLength={255} placeholder={t("ordHoldReasonPlaceholder")} onChange={(e) => setHoldReason(e.target.value)} />
                <Button variant="secondary" loading={busy} onClick={() => setHold(true)}>{t("ordPutOnHold")}</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message the customer, as the store */}
      {canAct && (
        <div className="space-y-2 rounded-sm border border-stone/20 p-3">
          <label htmlFor="msg" className="text-xs font-medium text-stone uppercase tracking-wide block">{t("ordMessageTitle")}</label>
          <textarea id="msg" rows={3} maxLength={2000} value={message} placeholder={t("ordMessagePlaceholder")}
            onChange={(e) => setMessage(e.target.value)} className={`${field} resize-y`} />
          <Button loading={busy} disabled={!message.trim()} onClick={sendMessage}>{t("ordSend")}</Button>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">{t("ordTimeline")}</p>
        {order.timeline.length === 0 ? (
          <p className="text-stone">{t("ordNoHistory")}</p>
        ) : (
          <ul className="space-y-2">
            {order.timeline.map((l) => (
              <li key={l.id} className="border-s-2 border-gold/50 ps-3">
                <p className="text-ink">{logLine(l)}{l.changes?.reason ? ` — ${l.changes.reason}` : ""}{l.changes?.excerpt ? ` — “${l.changes.excerpt}”` : ""}</p>
                <p className="text-xs text-stone">{l.admin ? t("ordBy", { name: l.admin }) : ""}{l.at ? ` · ${formatDate(l.at)}` : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
