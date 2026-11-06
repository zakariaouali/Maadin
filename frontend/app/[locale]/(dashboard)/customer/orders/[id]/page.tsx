"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api, { apiErrorMessage } from "@/lib/api";
import { Alert, Button, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";
import { OrderTimeline } from "@/components/shop/OrderTimeline";
import { getImageUrl } from "@/lib/image";
import Image from "next/image";
import { formatDate, formatPrice } from "@/lib/i18n-helpers";

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
  on_hold?: boolean;
  total_price: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  tracking_number?: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  items: OrderItem[];
  seller?: { store_name: string };
}

interface MyReview { id: number; product_id: number; rating: number; content: string }

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
          aria-label={`${star} / 5`}
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
  const tu = useTranslations("ui");
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // reviews: what this customer already wrote, by product
  const [myReviews, setMyReviews] = useState<Map<number, MyReview>>(new Map());
  const [activeReview, setActiveReview] = useState<{ productId: number; orderId: number; reviewId?: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewNote, setReviewNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/customer/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => setError(tu("failedLoadOrder")))
      .finally(() => setLoading(false));

    api.get("/customer/reviews")
      .then((r) => setMyReviews(new Map((r.data as MyReview[]).map((rev) => [rev.product_id, rev]))))
      .catch(() => {});
  }, [id, tu]);

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelMsg(null);
    try {
      await api.put(`/customer/orders/${order.id}/cancel`);
      setOrder((o) => o ? { ...o, status: "cancelled", cancelled_at: new Date().toISOString() } : o);
      setCancelMsg({ ok: true, text: t("cancelSuccess") });
    } catch (err) {
      setCancelMsg({ ok: false, text: apiErrorMessage(err, t("cancelFailed")) });
    }
    setCancelling(false);
  };

  const openReview = (productId: number) => {
    setActiveReview({ productId, orderId: order!.id });
    setRating(5);
    setContent("");
    setReviewNote(null);
  };

  const openEdit = (review: MyReview) => {
    setActiveReview({ productId: review.product_id, orderId: order!.id, reviewId: review.id });
    setRating(review.rating);
    setContent(review.content);
    setReviewNote(null);
    setConfirmDeleteFor(null);
  };

  const submitReview = async () => {
    if (!activeReview) return;
    setSubmitting(true);
    setReviewNote(null);
    try {
      if (activeReview.reviewId) {
        const { data } = await api.put(`/customer/reviews/${activeReview.reviewId}`, { rating, content });
        setMyReviews((prev) => new Map(prev).set(activeReview.productId, { id: data.id, product_id: activeReview.productId, rating: data.rating, content: data.content }));
        setReviewNote({ ok: true, text: t("reviewUpdated") });
      } else {
        const { data } = await api.post("/customer/reviews", {
          order_id: activeReview.orderId,
          product_id: activeReview.productId,
          rating,
          content,
        });
        setMyReviews((prev) => new Map(prev).set(activeReview.productId, { id: data.id, product_id: activeReview.productId, rating, content }));
        setReviewNote({ ok: true, text: t("reviewed") });
      }
      setActiveReview(null);
    } catch (err) {
      setReviewNote({ ok: false, text: apiErrorMessage(err, t("reviewFailed")) });
    }
    setSubmitting(false);
  };

  const deleteReview = async (review: MyReview) => {
    setDeleting(true);
    setReviewNote(null);
    try {
      await api.delete(`/customer/reviews/${review.id}`);
      setMyReviews((prev) => { const next = new Map(prev); next.delete(review.product_id); return next; });
      setConfirmDeleteFor(null);
      setReviewNote({ ok: true, text: t("reviewDeleted") });
    } catch (err) {
      setReviewNote({ ok: false, text: apiErrorMessage(err, t("reviewFailed")) });
    }
    setDeleting(false);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error || !order) return <Alert type="error">{error || tu("orderNotFound")}</Alert>;

  const canCancel = order.status === "pending";
  const isDelivered = order.status === "delivered";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/orders" className="text-stone hover:text-ink transition-colors no-print">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <PageHeader title={`${t("orderDetail")} \u2066#${order.order_number}\u2069`} />
      </div>

      {cancelMsg && <Alert type={cancelMsg.ok ? "success" : "error"}>{cancelMsg.text}</Alert>}
      {reviewNote && <Alert type={reviewNote.ok ? "success" : "error"}>{reviewNote.text}</Alert>}

      {/* Status + actions */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <OrderStatusBadge status={order.status} />
          <p className="text-xs text-stone">
            {t("placedOn")} {formatDate(order.created_at)}
          </p>
          {order.seller && (
            <p className="text-xs text-stone">{order.seller.store_name}</p>
          )}
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="ghost" size="sm" onClick={() => window.print()}>{t("printReceipt")}</Button>
          {canCancel && (
            <Button variant="secondary" size="sm" loading={cancelling} onClick={cancelOrder}>
              {t("cancelOrder")}
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <OrderTimeline order={order} />

      {/* Items */}
      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone/10">
          <h2 className="text-sm font-semibold text-ink">{t("items")}</h2>
        </div>
        <ul className="divide-y divide-stone/10">
          {order.items.map((item) => {
            const img = getImageUrl(item.product?.primary_image?.image_path);
            const mine = myReviews.get(item.product_id);
            const isEditing = activeReview?.productId === item.product_id;

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
                      {t("unitPrice")}: {formatPrice(item.price_at_purchase)} · {t("qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-ink">
                      {formatPrice(parseFloat(item.price_at_purchase) * item.quantity)}
                    </p>
                    {isDelivered && !mine && (
                      <button
                        onClick={() => isEditing ? setActiveReview(null) : openReview(item.product_id)}
                        className="text-xs text-gold-deep hover:underline font-medium mt-1 no-print"
                      >
                        {isEditing ? tCommon("cancel") : t("leaveReview")}
                      </button>
                    )}
                  </div>
                </div>

                {/* My review: shown, with edit and delete */}
                {isDelivered && mine && !isEditing && (
                  <div className="bg-sand/60 rounded-sm border border-stone/10 px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gold-deep text-base leading-none" aria-label={`${mine.rating} / 5`}>
                        {"★".repeat(mine.rating)}<span className="text-stone/30">{"★".repeat(5 - mine.rating)}</span>
                      </span>
                      <div className="flex items-center gap-3 text-xs no-print">
                        <button onClick={() => openEdit(mine)} className="text-gold-deep hover:underline font-medium">{t("editReview")}</button>
                        {confirmDeleteFor === mine.id ? (
                          <span className="flex items-center gap-2">
                            <span className="text-stone">{t("deleteReviewSure")}</span>
                            <button disabled={deleting} onClick={() => deleteReview(mine)} className="text-henna hover:underline font-medium">{t("deleteReviewYes")}</button>
                            <button onClick={() => setConfirmDeleteFor(null)} className="text-stone hover:underline">{tCommon("cancel")}</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDeleteFor(mine.id)} className="text-henna hover:underline">{t("deleteReview")}</button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1.5 text-ink whitespace-pre-line" dir="auto">{mine.content}</p>
                  </div>
                )}

                {/* Inline review form (new or edit) */}
                {isEditing && (
                  <div className="bg-sand rounded-sm border border-stone/20 p-4 space-y-3 no-print">
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
          <span className="text-sm text-stone">{tu("total")}</span>
          <span className="font-semibold text-ink">{formatPrice(order.total_price)}</span>
        </div>
      </div>

      {/* Delivered CTA */}
      {isDelivered && order.items.some((item) => !myReviews.has(item.product_id)) && (
        <div className="bg-gold/10 border border-gold/30 rounded-sm px-5 py-4 flex items-center gap-3 no-print">
          <span className="text-xl">⭐</span>
          <p className="text-sm text-ink">{t("leaveReview")} — {tu("shareExperience")}</p>
        </div>
      )}

      {/* Shipping info */}
      <div className="bg-white border border-stone/20 rounded-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">{t("orderInfo")}</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <span className="text-stone">{tu("address")}</span>
          <span className="text-ink" dir="auto">{order.shipping_address}</span>
          <span className="text-stone">{tu("city")}</span>
          <span className="text-ink" dir="auto">{order.shipping_city}</span>
          <span className="text-stone">{tu("phone")}</span>
          <span className="text-ink" dir="ltr">{order.shipping_phone}</span>
          {order.notes && (
            <>
              <span className="text-stone">{tu("notes")}</span>
              <span className="text-ink whitespace-pre-line" dir="auto">{order.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
