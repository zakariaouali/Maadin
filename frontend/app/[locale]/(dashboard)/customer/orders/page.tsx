"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Badge, Button, EmptyState, OrderStatusBadge, PageHeader, Spinner } from "@/components/ui";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_city: string;
  created_at: string;
  items: OrderItem[];
  seller?: { store_name: string };
}

interface MyReview {
  id: number;
  product_id: number;
}

export default function CustomerOrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ orderId: number; productId: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = async () => {
    const [ordersRes, reviewsRes] = await Promise.all([
      api.get("/customer/orders"),
      api.get("/customer/reviews"),
    ]);
    setOrders(ordersRes.data);
    setMyReviews(reviewsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const hasReviewed = (productId: number) => myReviews.some((r) => r.product_id === productId);

  const startReview = (orderId: number, productId: number) => {
    setReviewing({ orderId, productId });
    setRating(5);
    setContent("");
    setReviewError("");
  };

  const submitReview = async () => {
    if (!reviewing) return;
    setReviewError("");
    setSubmittingReview(true);
    try {
      await api.post("/customer/reviews", {
        order_id: reviewing.orderId,
        product_id: reviewing.productId,
        rating,
        content,
      });
      setReviewing(null);
      await load();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || t("reviewFailed"));
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title={t("title")} />

      {confirmed && (
        <Alert type="success" className="mb-6">
          {t("confirmedBanner", { count: confirmed })}
        </Alert>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title={t("noOrders")}
          description={t("noOrdersDesc")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-stone/20 rounded-sm overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-stone/10 bg-sand">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink font-medium">{order.order_number}</span>
                  {order.seller?.store_name && (
                    <span className="text-xs text-stone">· {order.seller.store_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-stone">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="px-5 py-4 divide-y divide-stone/10">
                {order.items.map((item) => {
                  const isReviewing =
                    reviewing?.orderId === order.id && reviewing?.productId === item.product_id;

                  return (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink">{item.product_name}</p>
                          <p className="text-xs text-stone mt-0.5">
                            ×{item.quantity} · {item.price_at_purchase} MAD
                          </p>
                        </div>

                        {order.status === "delivered" && (
                          hasReviewed(item.product_id) ? (
                            <span className="text-xs text-gold-deep flex items-center gap-1 shrink-0">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              {t("reviewed")}
                            </span>
                          ) : (
                            <button
                              onClick={() => startReview(order.id, item.product_id)}
                              className="text-xs text-gold-deep hover:underline shrink-0 font-medium"
                            >
                              {t("leaveReview")}
                            </button>
                          )
                        )}
                      </div>

                      {/* Inline review form */}
                      {isReviewing && (
                        <div className="mt-3 p-4 bg-sand rounded-sm border border-stone/20">
                          <p className="text-xs font-medium text-ink mb-3">{t("yourReview")}</p>

                          {/* Star rating */}
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-lg leading-none transition-colors ${
                                  star <= rating ? "text-gold" : "text-stone/30"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={3}
                            placeholder={t("reviewPlaceholder")}
                            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
                          />

                          {reviewError && (
                            <p className="text-xs text-henna mt-2">{reviewError}</p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              loading={submittingReview}
                              onClick={submitReview}
                            >
                              {tCommon("submit")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewing(null)}
                            >
                              {tCommon("cancel")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order footer */}
              <div className="px-5 py-3 border-t border-stone/10 flex justify-between items-center">
                <span className="text-xs text-stone">{order.shipping_city}</span>
                <span className="text-sm font-semibold text-ink">{order.total_price} MAD</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
