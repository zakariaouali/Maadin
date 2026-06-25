"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { Alert, Badge, Button, Modal, PageHeader, Spinner } from "@/components/ui";

interface ProductImage { id: number; image_path: string; is_primary: boolean; }

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  rating: string;
  total_reviews: number;
  is_active: boolean;
  is_approved: boolean;
  description: string;
  short_description: string | null;
  sku: string | null;
  created_at: string;
  images: ProductImage[];
  seller: {
    id: number;
    store_name: string;
    store_slug: string;
    logo_path: string | null;
    phone_number: string;
    rating: string;
    total_reviews: number;
    user?: { name: string; email: string; phone?: string };
  };
  category: { id: number; name: string };
}

interface ProductRow {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  seller: { store_name: string };
  category: { name: string };
}

type Tab = "pending" | "approved" | "all";

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 cursor-zoom-out" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-w-[92vw] max-h-[92vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function ProductPreviewModal({
  product: p,
  acting,
  onApprove,
  onReject,
  onDelete,
}: {
  product: ProductDetail;
  acting: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [activeImg, setActiveImg] = useState<ProductImage | null>(
    p.images.find((i) => i.is_primary) ?? p.images[0] ?? null
  );
  const [lightbox, setLightbox] = useState<string | null>(null);
  const logoUrl = getImageUrl(p.seller.logo_path);
  const mainUrl = getImageUrl(activeImg?.image_path);

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <div className="flex flex-col gap-0">
        {/* Action bar */}
        <div className={`px-6 py-3 flex items-center justify-between gap-3 border-b border-stone/10 ${p.is_approved ? "bg-emerald-50" : "bg-amber-50"}`}>
          <div className="flex items-center gap-2">
            <Badge variant={p.is_approved ? "success" : "warning"}>
              {p.is_approved ? "Approved" : "Pending review"}
            </Badge>
            <Badge variant={p.is_active ? "success" : "default"}>
              {p.is_active ? "Active" : "Hidden"}
            </Badge>
            <span className="text-xs text-stone">{p.category.name}</span>
          </div>
          <div className="flex gap-2">
            {!p.is_approved && (
              <Button variant="primary" size="sm" loading={acting === p.id} onClick={() => onApprove(p.id)}>
                ✓ Approve & publish
              </Button>
            )}
            {p.is_approved && (
              <Button variant="secondary" size="sm" loading={acting === p.id} onClick={() => onReject(p.id)}>
                Revoke approval
              </Button>
            )}
            <Button variant="danger" size="sm" loading={acting === p.id} onClick={() => onDelete(p.id)}>
              Delete
            </Button>
          </div>
        </div>

        {/* Product preview — mirrors what buyer sees */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* Left: image gallery */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-sand border border-stone/15 cursor-zoom-in group"
              onClick={() => mainUrl && setLightbox(mainUrl)}
            >
              {mainUrl ? (
                <>
                  <Image src={mainUrl} alt={p.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone/30">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {p.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {p.images.map((img) => {
                  const url = getImageUrl(img.image_path);
                  return url ? (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(img)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImg?.id === img.id ? "border-gold shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <Image src={url} alt="" fill sizes="56px" className="object-cover" />
                    </button>
                  ) : null;
                })}
              </div>
            )}

            {/* Image count */}
            <p className="text-[11px] text-stone">{p.images.length} image{p.images.length !== 1 ? "s" : ""} uploaded</p>
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-5">
            {/* Name & price */}
            <div>
              <h2 className="text-xl font-bold text-ink leading-snug">{p.name}</h2>
              {p.short_description && (
                <p className="text-sm text-stone mt-1 leading-relaxed">{p.short_description}</p>
              )}
              <div className="flex items-end gap-3 mt-3">
                <span className="text-2xl font-extrabold text-ink">{Number(p.price).toLocaleString()}</span>
                <span className="text-base text-stone mb-0.5">MAD</span>
              </div>
              {Number(p.rating) > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a227" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span className="text-sm font-medium text-ink">{Number(p.rating).toFixed(1)}</span>
                  <span className="text-xs text-stone">({p.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Category", value: p.category.name },
                { label: "Stock", value: `${p.stock_quantity} units` },
                { label: "SKU", value: p.sku ?? "—" },
                { label: "Listed", value: new Date(p.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sand/60 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-stone font-medium">{label}</p>
                  <p className="text-sm text-ink font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs uppercase tracking-widest text-stone font-medium mb-2">Description</p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{p.description}</p>
            </div>

            {/* Seller card */}
            <div className="border border-stone/20 rounded-xl p-4 flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  <Image src={logoUrl} alt="" fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="text-gold-deep font-bold">{p.seller.store_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{p.seller.store_name}</p>
                {p.seller.user && (
                  <p className="text-xs text-stone truncate">{p.seller.user.name} · {p.seller.user.email}</p>
                )}
                {p.seller.phone_number && (
                  <p className="text-xs text-stone">{p.seller.phone_number}</p>
                )}
              </div>
              {Number(p.seller.rating) > 0 && (
                <div className="flex items-center gap-1 text-xs text-stone shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9a227" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {Number(p.seller.rating).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reviewing, setReviewing] = useState<ProductDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = async (currentTab = tab, currentSearch = search) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (currentSearch) params.search = currentSearch;
    if (currentTab === "pending") params.is_approved = "false";
    if (currentTab === "approved") params.is_approved = "true";
    const { data } = await api.get("/admin/products", { params });
    setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const switchTab = (t: Tab) => { setTab(t); load(t, search); };

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    setReviewing(null);
    try {
      const { data } = await api.get(`/admin/products/${id}`);
      setReviewing(data);
    } catch {}
    setLoadingDetail(false);
  };

  const approve = async (id: number) => {
    setActing(id); setError(""); setSuccess("");
    try {
      await api.put(`/admin/products/${id}/approve`);
      setSuccess("Product approved and published.");
      setReviewing((prev) => prev ? { ...prev, is_approved: true, is_active: true } : null);
      await load();
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const reject = async (id: number) => {
    setActing(id); setError(""); setSuccess("");
    try {
      await api.put(`/admin/products/${id}/reject`);
      setSuccess("Product rejected.");
      setReviewing(null);
      await load();
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this product permanently?")) return;
    setActing(id);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setReviewing(null);
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending Approval" },
    { key: "approved", label: "Approved" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title="Products" />

      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {success && <Alert type="success" className="mb-4">{success}</Alert>}

      <div className="flex gap-1 mb-5 bg-sand rounded-sm p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={`px-4 py-1.5 rounded-sm text-sm transition-colors ${tab === t.key ? "bg-white text-ink shadow-sm font-medium" : "text-stone hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(tab, search); }} className="flex gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
          className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep flex-1 max-w-xs" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <p className="text-stone text-sm py-8 text-center">No products found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-stone/20 rounded-sm px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-stone mt-0.5">
                  {p.seller.store_name} · {p.category.name} · {p.price} MAD
                </p>
                <p className="text-xs text-stone/60 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={p.is_approved ? "success" : "warning"}>
                  {p.is_approved ? "Approved" : "Pending"}
                </Badge>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openDetail(p.id)}>
                  View
                </Button>
                {!p.is_approved && (
                  <Button size="sm" variant="primary" loading={acting === p.id} onClick={() => approve(p.id)}>
                    Approve
                  </Button>
                )}
                {p.is_approved && (
                  <Button size="sm" variant="secondary" loading={acting === p.id} onClick={() => reject(p.id)}>
                    Revoke
                  </Button>
                )}
                <Button size="sm" variant="danger" loading={acting === p.id} onClick={() => remove(p.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
      <Modal
        open={reviewing !== null || loadingDetail}
        onClose={() => setReviewing(null)}
        title="Product preview"
        maxWidth="max-w-4xl"
        noPadding
      >
        {loadingDetail ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : reviewing ? (
          <ProductPreviewModal
            product={reviewing}
            acting={acting}
            onApprove={approve}
            onReject={reject}
            onDelete={remove}
          />
        ) : null}
      </Modal>
    </div>
  );
}
