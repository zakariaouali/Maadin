import { getTranslations } from "next-intl/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  customer: { name: string };
}

async function fetchReviews(productId: number): Promise<Review[]> {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24"
          fill={star <= rating ? "#c9a227" : "none"}
          stroke="#c9a227" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export async function ProductReviews({
  productId,
  totalReviews,
  locale,
}: {
  productId: number;
  totalReviews: number;
  locale: string;
}) {
  const [reviews, t] = await Promise.all([
    fetchReviews(productId),
    getTranslations({ locale, namespace: "products" }),
  ]);

  return (
    <div className="mt-16">
      <div className="zellige-divider mb-10" />
      <h2 className="font-display text-2xl text-ink mb-6">
        {t("reviews")} ({totalReviews})
      </h2>

      {reviews.length === 0 ? (
        <p className="text-stone text-sm">{t("noReviews")}</p>
      ) : (
        <div className="flex flex-col divide-y divide-stone/10">
          {reviews.map((r) => (
            <div key={r.id} className="py-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">{r.customer.name}</span>
                  <StarRow rating={r.rating} />
                </div>
                <time className="text-xs text-stone">
                  {new Date(r.created_at).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              {r.title && <p className="text-sm font-medium text-ink mb-1">{r.title}</p>}
              <p className="text-sm text-stone leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="mt-16 animate-pulse">
      <div className="h-px bg-stone/20 mb-10" />
      <div className="h-6 w-32 bg-stone/20 rounded mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-6 border-t border-stone/10 space-y-2">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <div className="h-3 w-24 bg-stone/20 rounded" />
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => <div key={s} className="w-3 h-3 bg-stone/20 rounded-sm" />)}
              </div>
            </div>
            <div className="h-3 w-20 bg-stone/10 rounded" />
          </div>
          <div className="h-3 w-4/5 bg-stone/10 rounded" />
          <div className="h-3 w-3/5 bg-stone/10 rounded" />
        </div>
      ))}
    </div>
  );
}
