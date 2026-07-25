"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { Alert, Badge, Button, Modal, PageHeader, Spinner } from "@/components/ui";

interface ProductImage { id: number; image_path: string; is_primary: boolean; }
interface Category { id: number; name: string; }

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
  primary_image?: { image_path: string } | null;
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

function EditForm({
  product,
  categories,
  onSaved,
}: {
  product: ProductDetail;
  categories: Category[];
  onSaved: (updated: ProductDetail) => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    short_description: product.short_description ?? "",
    description: product.description,
    price: product.price,
    stock_quantity: String(product.stock_quantity),
    sku: product.sku ?? "",
    category_id: String(product.category.id),
    is_active: product.is_active,
  });
  const [images, setImages] = useState<ProductImage[]>(product.images);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("admin");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
        category_id: parseInt(form.category_id),
        sku: form.sku || null,
        short_description: form.short_description || null,
      };
      const { data } = await api.put(`/admin/products/${product.id}`, payload);
      setSuccess(t("productSaved"));
      onSaved(data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? Object.values(e.response?.data?.errors ?? {}).flat().join(" ") ?? "Failed to save.");
    }
    setSaving(false);
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images[]", f));
      const { data } = await api.post(`/admin/products/${product.id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, ...data]);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Upload failed.");
    }
    setUploading(false);
  };

  const setPrimary = async (imageId: number) => {
    try {
      await api.put(`/admin/products/${product.id}/images/${imageId}/primary`);
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    } catch {}
  };

  const deleteImage = async (imageId: number) => {
    setDeleting(imageId);
    try {
      await api.delete(`/admin/products/${product.id}/images/${imageId}`);
      const removed = images.find((i) => i.id === imageId);
      let updated = images.filter((i) => i.id !== imageId);
      if (removed?.is_primary && updated.length > 0) {
        updated = updated.map((img, idx) => ({ ...img, is_primary: idx === 0 }));
      }
      setImages(updated);
    } catch {}
    setDeleting(null);
  };

  const field = "border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep w-full";

  return (
    <div className="p-6 space-y-6">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("name")}</label>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("priceMad")}</label>
          <input className={field} type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("stock")}</label>
          <input className={field} type="number" min="0" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("categories")}</label>
          <select className={field} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("sku")}</label>
          <input className={field} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("shortDescription")}</label>
          <input className={field} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-stone uppercase tracking-wide mb-1 block">{t("description")}</label>
          <textarea className={field + " min-h-[120px] resize-y"} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="is_active" type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-gold-deep" />
          <label htmlFor="is_active" className="text-sm text-ink">{t("listedLabel")}</label>
        </div>
      </div>

      <Button variant="primary" loading={saving} onClick={save}>{t("saveChanges")}</Button>

      {/* Image management */}
      <div>
        <p className="text-xs font-medium text-stone uppercase tracking-wide mb-3">{t("imagesLabel", { count: images.length })}</p>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((img) => {
            const url = getImageUrl(img.image_path);
            return url ? (
              <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-stone/20">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  {!img.is_primary && (
                    <button
                      onClick={() => setPrimary(img.id)}
                      className="text-[10px] text-white bg-gold/80 hover:bg-gold px-1.5 py-0.5 rounded whitespace-nowrap"
                    >
                      {t("setMain")}
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    disabled={deleting === img.id}
                    className="text-[10px] text-white bg-red-500/80 hover:bg-red-500 px-1.5 py-0.5 rounded"
                  >
                    {deleting === img.id ? "…" : t("delete")}
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute top-1 start-1 bg-gold text-white text-[9px] font-bold px-1 rounded">MAIN</span>
                )}
              </div>
            ) : null;
          })}

          {images.length < 10 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-stone/30 hover:border-gold-deep flex items-center justify-center text-stone hover:text-gold-deep transition-colors"
            >
              {uploading ? (
                <Spinner size="sm" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadImages(e.target.files)}
        />
        <p className="text-[11px] text-stone/60">{t("imageHint")}</p>
      </div>
    </div>
  );
}

function ProductModal({
  product: initial,
  categories,
  acting,
  onApprove,
  onReject,
  onDelete,
}: {
  product: ProductDetail;
  categories: Category[];
  acting: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations("admin");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [product, setProduct] = useState(initial);
  const [activeImg, setActiveImg] = useState<ProductImage | null>(
    product.images.find((i) => i.is_primary) ?? product.images[0] ?? null
  );
  const [lightbox, setLightbox] = useState<string | null>(null);
  const logoUrl = getImageUrl(product.seller.logo_path);
  const mainUrl = getImageUrl(activeImg?.image_path);

  const handleSaved = (updated: ProductDetail) => {
    setProduct(prev => ({ ...prev, ...updated, seller: updated.seller ?? prev.seller }));
    setActiveImg(updated.images.find((i) => i.is_primary) ?? updated.images[0] ?? null);
    setMode("view");
  };

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Action bar */}
      <div className={`px-6 py-3 flex items-center justify-between gap-3 border-b border-stone/10 ${product.is_approved ? "bg-emerald-50" : "bg-amber-50"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={product.is_approved ? "success" : "warning"}>
            {product.is_approved ? t("approved") : t("pendingReview")}
          </Badge>
          <Badge variant={product.is_active ? "success" : "default"}>
            {product.is_active ? t("active") : t("hidden")}
          </Badge>
          <span className="text-xs text-stone">{product.category.name}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={mode === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setMode(mode === "edit" ? "view" : "edit")}>
            {mode === "edit" ? t("preview") : t("edit")}
          </Button>
          {!product.is_approved && (
            <Button variant="primary" size="sm" loading={acting === product.id} onClick={() => onApprove(product.id)}>
              ✓ {t("approve")}
            </Button>
          )}
          {product.is_approved && (
            <Button variant="secondary" size="sm" loading={acting === product.id} onClick={() => onReject(product.id)}>
              {t("revoke")}
            </Button>
          )}
          <Button variant="danger" size="sm" loading={acting === product.id} onClick={() => onDelete(product.id)}>
            {t("delete")}
          </Button>
        </div>
      </div>

      {mode === "edit" ? (
        <EditForm product={product} categories={categories} onSaved={handleSaved} />
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="flex flex-col gap-3">
            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-sand border border-stone/15 cursor-zoom-in group"
              onClick={() => mainUrl && setLightbox(mainUrl)}
            >
              {mainUrl ? (
                <>
                  <Image src={mainUrl} alt={product.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img) => {
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
            <p className="text-[11px] text-stone">{product.images.length} image{product.images.length !== 1 ? "s" : ""} uploaded</p>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-ink leading-snug">{product.name}</h2>
              {product.short_description && (
                <p className="text-sm text-stone mt-1 leading-relaxed">{product.short_description}</p>
              )}
              <div className="flex items-end gap-3 mt-3">
                <span className="text-2xl font-extrabold text-ink">{Number(product.price).toLocaleString()}</span>
                <span className="text-base text-stone mb-0.5">MAD</span>
              </div>
              {Number(product.rating) > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a227" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span className="text-sm font-medium text-ink">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-xs text-stone">({t("reviews", { count: product.total_reviews })})</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("categories"), value: product.category.name },
                { label: t("stock"), value: t("units", { count: product.stock_quantity }) },
                { label: t("skuLabel"), value: product.sku ?? "—" },
                { label: t("memberSince"), value: new Date(product.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sand/60 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-stone font-medium">{label}</p>
                  <p className="text-sm text-ink font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-stone font-medium mb-2">{t("description")}</p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="border border-stone/20 rounded-xl p-4 flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  <Image src={logoUrl} alt="" fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="text-gold-deep font-bold">{product.seller.store_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{product.seller.store_name}</p>
                {product.seller.user && (
                  <p className="text-xs text-stone truncate">{product.seller.user.name} · {product.seller.user.email}</p>
                )}
                {product.seller.phone_number && (
                  <p className="text-xs text-stone">{product.seller.phone_number}</p>
                )}
              </div>
              {Number(product.seller.rating) > 0 && (
                <div className="flex items-center gap-1 text-xs text-stone shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9a227" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {Number(product.seller.rating).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

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
    if (!confirm(t("deleteConfirm"))) return;
    setActing(id);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setReviewing(null);
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const t = useTranslations("admin");

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: t("pendingApprovalTab") },
    { key: "approved", label: t("approved") },
    { key: "all", label: t("all") },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title={t("products")} />

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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")}
          className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep flex-1 max-w-xs" />
        <Button type="submit" variant="secondary" size="sm">{t("search")}</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <p className="text-stone text-sm py-8 text-center">{t("noProductsFound")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-stone/20 rounded-sm px-4 py-3 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-sand border border-stone/10 shrink-0 flex items-center justify-center">
                {p.primary_image ? (
                  <Image src={getImageUrl(p.primary_image.image_path) ?? ""} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone/30">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-stone mt-0.5">
                  {p.seller.store_name} · {p.category.name} · {p.price} MAD
                </p>
                <p className="text-xs text-stone/60 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={p.is_approved ? "success" : "warning"}>
                  {p.is_approved ? t("approved") : t("pending")}
                </Badge>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openDetail(p.id)}>{t("viewEdit")}</Button>
                {!p.is_approved && (
                  <Button size="sm" variant="primary" loading={acting === p.id} onClick={() => approve(p.id)}>✓ {t("approve")}</Button>
                )}
                {p.is_approved && (
                  <Button size="sm" variant="secondary" loading={acting === p.id} onClick={() => reject(p.id)}>{t("revoke")}</Button>
                )}
                <Button size="sm" variant="danger" loading={acting === p.id} onClick={() => remove(p.id)}>{t("delete")}</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={reviewing !== null || loadingDetail}
        onClose={() => setReviewing(null)}
        title="Product"
        maxWidth="max-w-4xl"
        noPadding
      >
        {loadingDetail ? (
          <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
        ) : reviewing ? (
          <ProductModal
            product={reviewing}
            categories={categories}
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
