"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import api from "@/lib/api";
import { EmptyState, PageHeader, Spinner } from "@/components/ui";
import { getImageUrl } from "@/lib/image";

interface Customer {
  id: number;
  name: string;
  avatar_path: string | null;
}

interface ProductImage {
  image_path: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  primary_image?: ProductImage;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  created_at: string;
  customer: Customer;
  product: Product;
}

interface Paginated {
  data: Review[];
  current_page: number;
  last_page: number;
  total: number;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= rating ? "#c9a227" : "none"}
          stroke={s <= rating ? "#c9a227" : "#d1c4b8"}
          strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ customer }: { customer: Customer }) {
  const avatarUrl = getImageUrl(customer.avatar_path);
  const initials = customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gold/20 flex items-center justify-center shrink-0 border border-stone/10">
      {avatarUrl ? (
        <Image src={avatarUrl} alt={customer.name} width={40} height={40} className="object-cover w-full h-full" />
      ) : (
        <span className="text-sm font-semibold text-gold-deep">{initials}</span>
      )}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("seller");
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="bg-white border border-stone/20 rounded-sm p-6 flex flex-col sm:flex-row gap-8 mb-6">
      {/* Big score */}
      <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px]">
        <p className="font-display text-5xl text-ink">{avg.toFixed(1)}</p>
        <Stars rating={Math.round(avg)} size={18} />
        <p className="text-xs text-stone mt-1">{reviews.length} {t("totalReviews")}</p>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        {counts.map(({ star, count }) => {
          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-stone">
              <span className="w-3 text-right">{star}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#c9a227" stroke="#c9a227" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="flex-1 bg-stone/10 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SellerReviewsPage() {
  const t = useTranslations("seller");
  const [data, setData] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/seller/reviews?page=${page}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-3xl">
      <PageHeader title={t("myReviews")} />

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title={t("noReviews")}
          description={t("noReviewsDesc")}
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
        />
      ) : (
        <>
          <RatingSummary reviews={data.data} />

          <div className="flex flex-col gap-4">
            {data.data.map((review) => {
              const productImg = getImageUrl(review.product?.primary_image?.image_path);
              return (
                <div key={review.id} className="bg-white border border-stone/20 rounded-sm p-5 space-y-4">
                  {/* Top row: reviewer + rating + date */}
                  <div className="flex items-start gap-3">
                    <Avatar customer={review.customer} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{review.customer.name}</p>
                        <time className="text-xs text-stone shrink-0">
                          {new Date(review.created_at).toLocaleDateString(undefined, {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </time>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={review.rating} size={14} />
                        <span className="text-xs font-semibold text-ink">{review.rating}/5</span>
                        {review.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {t("verifiedPurchase")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review text */}
                  {review.title && (
                    <p className="text-sm font-semibold text-ink">{review.title}</p>
                  )}
                  <p className="text-sm text-stone leading-relaxed">{review.content}</p>

                  {/* Product pill */}
                  <div className="flex items-center gap-3 pt-1 border-t border-stone/10">
                    <div className="w-9 h-9 rounded-sm overflow-hidden bg-sand shrink-0">
                      {productImg ? (
                        <Image src={productImg} alt={review.product.name} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-sand-dark" />
                      )}
                    </div>
                    <p className="text-xs text-stone truncate">
                      <span className="text-stone/60">on </span>
                      <span className="text-ink font-medium">{review.product.name}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-stone/30 rounded-sm text-stone hover:text-ink hover:border-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="text-sm text-stone">
                {page} / {data.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                disabled={page === data.last_page}
                className="px-4 py-2 text-sm border border-stone/30 rounded-sm text-stone hover:text-ink hover:border-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
