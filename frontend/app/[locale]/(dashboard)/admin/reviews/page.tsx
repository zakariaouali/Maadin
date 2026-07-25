"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import api from "@/lib/api";

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  status: "pending" | "approved" | "rejected";
  is_verified_purchase: boolean;
  created_at: string;
  deleted_at: string | null;
  customer: { id: number; name: string; avatar_path?: string };
  product: { id: number; name: string; slug: string };
  seller: { id: number; store_name: string; store_slug: string };
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= rating ? "#c9a227" : "none"} stroke="#c9a227" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, avatarPath }: { name: string; avatarPath?: string }) {
  const url = avatarPath ? getImageUrl(avatarPath) : null;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gold/20 flex items-center justify-center text-gold-deep text-xs font-semibold">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending:  "bg-amber-100 text-amber-700",
};

export default function AdminReviewsPage() {
  const t = useTranslations("admin");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await api.get("/admin/reviews", { params });
      setReviews(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const act = async (id: number, action: "approve" | "reject" | "delete") => {
    setActing(id);
    try {
      if (action === "delete") await api.delete(`/admin/reviews/${id}`);
      else await api.put(`/admin/reviews/${id}/${action}`);
      await load();
    } finally {
      setActing(null);
    }
  };

  const pending = reviews.filter(r => r.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Reviews</h1>
          <p className="text-sm text-stone mt-0.5">{meta.total} total{pending > 0 && ` · ${pending} pending`}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone/20 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search review content…"
            className="flex-1 border border-stone/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-deep"
          />
          <button type="submit" className="px-4 py-2 bg-ink text-white text-sm rounded-lg hover:bg-gold-deep transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-1 border border-stone/20 rounded-lg overflow-hidden text-xs">
          {["", "pending", "approved", "rejected"].map(s => (
            <button key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 transition-colors capitalize ${status === s ? "bg-ink text-white font-semibold" : "text-stone hover:bg-sand"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-stone/10 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone/10 rounded-xl text-stone">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className={`bg-white border rounded-xl p-5 ${r.status === "pending" ? "border-amber-200" : "border-stone/10"}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">

                {/* Left: reviewer + content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Avatar name={r.customer.name} avatarPath={r.customer.avatar_path} />
                    <span className="text-sm font-medium text-ink">{r.customer.name}</span>
                    <Stars rating={r.rating} />
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                    {r.is_verified_purchase && (
                      <span className="text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Verified</span>
                    )}
                    {r.deleted_at && (
                      <span className="text-[11px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Deleted</span>
                    )}
                  </div>

                  {r.title && <p className="text-sm font-semibold text-ink mb-1">{r.title}</p>}
                  <p className="text-sm text-stone leading-relaxed line-clamp-3">{r.content}</p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-stone/60 flex-wrap">
                    <span>Product: <Link href={`/products/${r.product.slug}`} className="text-gold-deep hover:underline">{r.product.name}</Link></span>
                    <span>·</span>
                    <span>Store: <Link href={`/stores/${r.seller.store_slug}`} className="text-gold-deep hover:underline">{r.seller.store_name}</Link></span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right: actions */}
                {!r.deleted_at && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    {r.status !== "approved" && (
                      <button
                        onClick={() => act(r.id, "approve")}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Approve
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button
                        onClick={() => act(r.id, "reject")}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => act(r.id, "delete")}
                      disabled={acting === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm border border-stone/20 rounded-lg hover:bg-sand disabled:opacity-40 transition-colors">
            ← Prev
          </button>
          <span className="text-sm text-stone">{page} / {meta.last_page}</span>
          <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
            className="px-4 py-2 text-sm border border-stone/20 rounded-lg hover:bg-sand disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
