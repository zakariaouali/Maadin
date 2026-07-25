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
  product_id: number;
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
  created_at: string;
  items: OrderItem[];
  seller?: { store_name: string };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="text-2xl leading-none transition-colors"
          style={{ color: star <= (hover || value) ? "#c9a227" : "#d1c4b8" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  // reviews state
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [activeReview, setActiveReview] = useState<{ productId: number; orderId: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    api.get(`/customer/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => setError("Failed to load order."))
      .finally(() => setLoading(false));

    // load which products this user already reviewed
    api.get("/customer/reviews").then((r) => {
      const ids = new Set<number>(r.data.map((rev: any) => rev.product_id));
      setReviewedIds(ids);
    }).catch(() => {});
  }, [id]);

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelMsg("");
    try {
      await api.put(`/customer/orders/${order.id}/cancel`);
      setOrder((o) => o ? { ...o, status: "cancelled" } : o);
      setCancelMsg(t("cancelSuccess"));
    } catch (err: any) {
      setCancelMsg(err.response?.data?.message ?? t("cancelFailed"));
    }
    setCancelling(false);
  };

  const openReview = (productId: number) => {
    setActiveReview({ productId, orderId: order!.id });
    setRating(5);
    setContent("");
    setReviewMsg("");
  };

  const submitReview = async () => {
    if (!activeReview) return;
    setSubmitting(true);
    setReviewMsg("");
    try {
      await api.post("/customer/reviews", {
        order_id: activeReview.orderId,
        product_id: activeReview.productId,
        rating,
        content,
      });
      setReviewedIds((prev) => new Set([...prev, activeReview.productId]));
      setActiveReview(null);
      setReviewMsg(t("reviewed"));
    } catch (err: any) {
      setReviewMsg(err.response?.data?.message ?? t("reviewFailed"));
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error || !order) return <Alert type="error">{error || "Order not found."}</Alert>;

  const canCancel = order.status === "pending";
  const isDelivered = order.status === "delivered";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/orders" className="text-stone hover:text-ink transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <PageHeader title={`${t("orderDetail")} #${order.order_number}`} />
      </div>

      {cancelMsg && (
        <Alert type={cancelMsg === t("cancelSuccess") ? "success" : "error"}>{cancelMsg}</Alert>
      )}
      {reviewMsg && <Alert type="success">{reviewMsg}</Alert>}

      {/* Status + actions */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <OrderStatusBadge status={order.status} />
          <p className="text-xs text-stone">
            {t("placedOn")} {new Date(order.created_at).toLocaleDateString()}
          </p>
          {order.seller && (
            <p className="text-xs text-stone">{order.seller.store_name}</p>
          )}
        </div>
        {canCancel && (
          <Button variant="secondary" size="sm" loading={cancelling} onClick={cancelOrder}>
            {t("cancelOrder")}
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone/10">
          <h2 className="text-sm font-semibold text-ink">{t("items")}</h2>
        </div>
        <ul className="divide-y divide-stone/10">
          {order.items.map((item) => {
            const img = getImageUrl(item.product?.primary_image?.image_path);
            const alreadyReviewed = reviewedIds.has(item.product_id);
            const isReviewing = activeReview?.productId === item.product_id;

            return (
              <li key={item.id} className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-sm bg-sand overflow-hidden shrink-0">
                    {img ? (
                      <Image src={img} alt={item.product_name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-sand-dark" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium truncate">{item.product_name}</p>
                    <p className="text-xs text-stone">
                      {t("unitPrice")}: {parseFloat(item.price_at_purchase).toFixed(2)} MAD · {t("qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-ink">
                      {(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)} MAD
                    </p>
                    {isDelivered && (
                      alreadyReviewed ? (
                        <span className="flex items-center gap-1 text-xs text-gold-deep justify-end mt-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          {t("reviewed")}
                        </span>
                      ) : (
                        <button
                          onClick={() => isReviewing ? setActiveReview(null) : openReview(item.product_id)}
                          className="text-xs text-gold-deep hover:underline font-medium mt-1"
                        >
                          {isReviewing ? tCommon("cancel") : t("leaveReview")}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Inline review form */}
                {isReviewing && (
                  <div className="bg-sand rounded-sm border border-stone/20 p-4 space-y-3">
                    <p className="text-xs font-semibold text-ink">{t("yourReview")}</p>
                    <StarPicker value={rating} onChange={setRating} />
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      placeholder={t("reviewPlaceholder")}
                      className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" loading={submitting} onClick={submitReview}>
                        {tCommon("submit")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveReview(null)}>
                        {tCommon("cancel")}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="px-5 py-3 border-t border-stone/10 flex justify-between">
          <span className="text-sm text-stone">Total</span>
          <span className="font-semibold text-ink">{parseFloat(order.total_price).toFixed(2)} MAD</span>
        </div>
      </div>

      {/* Delivered CTA */}
      {isDelivered && order.items.some((item) => !reviewedIds.has(item.product_id)) && (
        <div className="bg-gold/10 border border-gold/30 rounded-sm px-5 py-4 flex items-center gap-3">
          <span className="text-xl">⭐</span>
          <p className="text-sm text-ink">{t("leaveReview")} — share your experience with these products!</p>
        </div>
      )}

      {/* Shipping info */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("orderInfo")}</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <span className="text-stone">Address</span>
          <span className="text-ink">{order.shipping_address}</span>
          <span className="text-stone">City</span>
          <span className="text-ink">{order.shipping_city}</span>
          <span className="text-stone">Phone</span>
          <span className="text-ink">{order.phone}</span>
          {order.notes && (
            <>
              <span className="text-stone">Notes</span>
              <span className="text-ink">{order.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
