"use client";

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Button, Modal, OrderStatusBadge, Spinner } from "@/components/ui";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { Link } from "@/i18n/navigation";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Category { id: number; name: string; }

interface ProductImage { id: number; image_path: string; is_primary: boolean; }

interface ProductDetail {
  id: number; name: string; price: string; stock_quantity: number;
  description: string; short_description: string | null; sku: string | null;
  is_active: boolean; is_approved: boolean; created_at: string;
  images: ProductImage[];
  category: { id: number; name: string };
}

interface AccountDetail {
  user: {
    id: number; name: string; email: string; phone: string | null;
    plan: "managed" | "premium"; subscription_expires_at: string | null; monthly_fee: string | null;
  };
  seller: {
    id: number; store_name: string; store_slug: string; logo_path: string | null;
    banner_path: string | null; store_description: string | null; status: string;
    phone_number: string | null; bank_name: string | null; bank_account_number: string | null;
    products_count: number; orders_count: number;
  } | null;
  orders: { id: number; status: string; total_price: string; created_at: string; customer: { name: string } | null }[];
  products: { id: number; name: string; price: string; is_active: boolean; is_approved: boolean; stock_quantity: number; created_at: string; primary_image?: { image_path: string } | null }[];
  conversations: { id: number; unread_count: number; last_message_at: string; buyer: { name: string; avatar_path: string | null }; product: { name: string } | null }[];
}

const TABS = ["Overview", "Store", "Orders", "Messages", "Products", "Subscription"] as const;
type Tab = typeof TABS[number];

function daysUntil(date: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Product edit modal ─────────────────────────────────────────────────── */
function ProductEditModal({
  product: initial,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductDetail;
  categories: Category[];
  onClose: () => void;
  onSaved: (p: ProductDetail) => void;
}) {
  const [form, setForm] = useState({
    name: initial.name,
    short_description: initial.short_description ?? "",
    description: initial.description,
    price: initial.price,
    stock_quantity: String(initial.stock_quantity),
    sku: initial.sku ?? "",
    category_id: String(initial.category.id),
    is_active: initial.is_active,
  });
  const [images, setImages] = useState<ProductImage[]>(initial.images);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("admin");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const { data } = await api.put(`/admin/products/${initial.id}`, {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
        category_id: parseInt(form.category_id),
        sku: form.sku || null,
        short_description: form.short_description || null,
      });
      setSuccess(t("productSaved"));
      onSaved({ ...data, images });
    } catch (e: any) {
      setError(e.response?.data?.message ?? Object.values(e.response?.data?.errors ?? {}).flat().join(" ") ?? "Failed.");
    }
    setSaving(false);
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images[]", f));
      const { data } = await api.post(`/admin/products/${initial.id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, ...data]);
    } catch (e: any) { setError(e.response?.data?.message ?? "Upload failed."); }
    setUploading(false);
  };

  const setPrimary = async (imageId: number) => {
    try {
      await api.put(`/admin/products/${initial.id}/images/${imageId}/primary`);
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    } catch {}
  };

  const deleteImage = async (imageId: number) => {
    setDeleting(imageId);
    try {
      await api.delete(`/admin/products/${initial.id}/images/${imageId}`);
      let updated = images.filter((i) => i.id !== imageId);
      const wasPrimary = images.find((i) => i.id === imageId)?.is_primary;
      if (wasPrimary && updated.length > 0) updated = updated.map((img, idx) => ({ ...img, is_primary: idx === 0 }));
      setImages(updated);
    } catch {}
    setDeleting(null);
  };

  const field = "border border-stone/20 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold/40 w-full bg-white";

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("name")}</label>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("priceMad")}</label>
          <input className={field} type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("stock")}</label>
          <input className={field} type="number" min="0" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("categories")}</label>
          <select className={field} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("sku")}</label>
          <input className={field} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("shortDescription")}</label>
          <input className={field} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone uppercase tracking-wide mb-1 block">{t("description")}</label>
          <textarea className={field + " min-h-[100px] resize-y"} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="is_active" type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-gold-deep" />
          <label htmlFor="is_active" className="text-sm text-ink">{t("listedLabel")}</label>
        </div>
      </div>

      <Button variant="primary" loading={saving} onClick={save} className="w-full">{t("saveChanges")}</Button>

      {/* Images */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-wide mb-3">{t("imagesLabel", { count: images.length })}</p>
        <div className="flex flex-wrap gap-3 mb-2">
          {images.map((img) => {
            const url = getImageUrl(img.image_path);
            return url ? (
              <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-stone/20">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                  {!img.is_primary && (
                    <button onClick={() => setPrimary(img.id)} className="text-[10px] text-white bg-gold/90 hover:bg-gold px-1.5 py-0.5 rounded whitespace-nowrap w-full text-center">
                      {t("setMain")}
                    </button>
                  )}
                  <button onClick={() => deleteImage(img.id)} disabled={deleting === img.id} className="text-[10px] text-white bg-red-500/90 hover:bg-red-500 px-1.5 py-0.5 rounded w-full text-center">
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
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-stone/30 hover:border-gold-deep flex items-center justify-center text-stone hover:text-gold-deep transition-colors">
              {uploading ? <Spinner size="sm" /> : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => e.target.files && uploadImages(e.target.files)} />
        <p className="text-[11px] text-stone/60">{t("imageHint")}</p>
      </div>

      <div className="flex justify-end pt-2 border-t border-stone/10">
        <button onClick={onClose} className="text-sm text-stone hover:text-ink transition-colors">{t("close")}</button>
      </div>
    </div>
  );
}

/* ─── Store edit / create panel ─────────────────────────────────────────── */
function StoreEditPanel({
  userId,
  seller: initial,
  onSaved,
}: {
  userId: string;
  seller: AccountDetail["seller"];
  onSaved: (s: AccountDetail["seller"]) => void;
}) {
  const t = useTranslations("admin");
  const [form, setForm] = useState({
    store_name:          initial?.store_name          ?? "",
    store_description:   initial?.store_description   ?? "",
    phone_number:        initial?.phone_number        ?? "",
    bank_name:           initial?.bank_name           ?? "",
    bank_account_number: initial?.bank_account_number ?? "",
  });
  const [logoFile,   setLogoFile]   = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [msg,    setMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const logoRef   = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const isCreate = !initial;
  const endpoint = isCreate
    ? `/admin/managed-sellers/${userId}/store`
    : `/admin/managed-sellers/${userId}/store/update`;

  const pickFile = (file: File, kind: "logo" | "banner") => {
    const url = URL.createObjectURL(file);
    if (kind === "logo")   { setLogoFile(file);   setLogoPreview(url); }
    else                   { setBannerFile(file); setBannerPreview(url); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile)   fd.append("logo",   logoFile);
    if (bannerFile) fd.append("banner", bannerFile);
    try {
      const { data } = await api.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg({ type: "ok", text: isCreate ? t("storeCreated") : t("storeSaved") });
      onSaved(data);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? Object.values(err.response?.data?.errors ?? {}).flat().join(" ") ?? t("failedAction");
      setMsg({ type: "err", text: String(msg) });
    }
    setSaving(false);
  };

  const existingLogo   = getImageUrl(initial?.logo_path   ?? undefined);
  const existingBanner = getImageUrl(initial?.banner_path ?? undefined);

  const inp = "w-full px-3 py-2 rounded-lg border border-stone/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";
  const lbl = "block text-xs font-semibold text-stone uppercase tracking-wider mb-1";

  return (
    <form onSubmit={submit} className="space-y-6">
      <h2 className="font-display text-lg text-ink">{isCreate ? t("createStore") : t("editStore")}</h2>

      {msg && (
        <p className={`text-sm rounded-lg px-4 py-2.5 ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}

      {/* Banner + logo pickers */}
      <div className="space-y-3">
        {/* Banner */}
        <div>
          <p className={lbl}>{t("banner")}</p>
          <div
            className="relative w-full h-28 rounded-xl overflow-hidden bg-sand border-2 border-dashed border-stone/25 cursor-pointer group hover:border-gold/50 transition-colors"
            onClick={() => bannerRef.current?.click()}
          >
            {(bannerPreview ?? existingBanner) ? (
              <Image src={bannerPreview ?? existingBanner!} alt="" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-stone/50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span className="text-xs">{t("clickToUpload")}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-ink text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                {t("changePhoto")}
              </span>
            </div>
          </div>
          <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], "banner")} />
          <p className="text-[11px] text-stone/50 mt-1">{t("bannerHint")}</p>
        </div>

        {/* Logo */}
        <div className="flex items-start gap-4">
          <div>
            <p className={lbl}>{t("logo")}</p>
            <div
              className="relative w-20 h-20 rounded-xl overflow-hidden bg-sand border-2 border-dashed border-stone/25 cursor-pointer group hover:border-gold/50 transition-colors"
              onClick={() => logoRef.current?.click()}
            >
              {(logoPreview ?? existingLogo) ? (
                <Image src={logoPreview ?? existingLogo!} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone/40">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => e.target.files?.[0] && pickFile(e.target.files[0], "logo")} />
            <p className="text-[11px] text-stone/50 mt-1">{t("logoHint")}</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={lbl}>{t("storeName")} *</label>
          <input className={inp} value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} required />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>{t("storeDescription")}</label>
          <textarea className={inp + " resize-none"} rows={3} value={form.store_description}
            onChange={e => setForm(f => ({ ...f, store_description: e.target.value }))} />
        </div>
        <div>
          <label className={lbl}>{t("phone")}</label>
          <input className={inp} value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
        </div>
        <div>
          <label className={lbl}>{t("bankName")}</label>
          <input className={inp} value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>{t("bankAccount")}</label>
          <input className={inp} value={form.bank_account_number} onChange={e => setForm(f => ({ ...f, bank_account_number: e.target.value }))} />
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="w-full py-2.5 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold-deep hover:text-white transition-colors disabled:opacity-50">
        {saving ? t("saving") : isCreate ? t("createStore") : t("saveStore")}
      </button>
    </form>
  );
}

/* ─── Subscription panel ─────────────────────────────────────────────────── */
function SubscriptionPanel({ user, onUpdated }: { user: AccountDetail["user"]; onUpdated: (u: AccountDetail["user"]) => void }) {
  const t = useTranslations("admin");
  const days = daysUntil(user.subscription_expires_at);
  const expired = days !== null && days < 0;
  const urgent  = days !== null && days <= 3 && !expired;

  const [form, setForm] = useState({
    subscription_expires_at: user.subscription_expires_at?.slice(0, 10) ?? "",
    monthly_fee: user.monthly_fee ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const res = await api.put(`/admin/managed-sellers/${user.id}/subscription`, form);
      onUpdated({ ...user, ...res.data });
      setMsg(t("subscriptionUpdated"));
    } catch { setMsg(t("failedUpdate")); }
    finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-stone/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";
  const lbl = "block text-xs font-semibold text-stone uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-5 ${expired ? "bg-henna/5 border-henna/30" : urgent ? "bg-amber-50 border-amber-200" : user.subscription_expires_at ? "bg-green-50 border-green-200" : "bg-sand border-stone/10"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-stone">{t("subscriptionStatus")}</p>
            {!user.subscription_expires_at ? (
              <p className="text-lg font-bold text-stone mt-1">{t("notSet")}</p>
            ) : expired ? (
              <p className="text-lg font-bold text-henna mt-1">{days !== 1 ? t("subscriptionExpiredDaysPlural", { days: Math.abs(days!) }) : t("subscriptionExpiredDays", { days: Math.abs(days!) })}</p>
            ) : urgent ? (
              <p className="text-lg font-bold text-amber-700 mt-1">{days !== 1 ? t("subscriptionExpiresInPlural", { days }) : t("subscriptionExpiresIn", { days })}</p>
            ) : (
              <p className="text-lg font-bold text-green-700 mt-1">{t("subscriptionDaysRemaining", { days: days! })}</p>
            )}
            {user.subscription_expires_at && (
              <p className="text-xs text-stone mt-0.5">{t("renewsLabel")} {new Date(user.subscription_expires_at).toLocaleDateString()}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-ink">{user.monthly_fee ? `${Number(user.monthly_fee).toLocaleString()} MAD` : "—"}</p>
            <p className="text-xs text-stone">{t("perMonth")}</p>
          </div>
        </div>
        {days !== null && days > 0 && days <= 31 && (
          <div className="mt-4">
            <div className="h-1.5 bg-stone/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${Math.min(100, (days / 31) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-stone mt-1">{t("daysLeft", { days, total: 31 })}</p>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border border-stone/10 p-5">
        <h3 className="font-semibold text-sm text-ink">{t("updateSubscription")}</h3>
        {msg && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{msg}</p>}
        <div>
          <label className={lbl}>{t("nextPaymentDate")} *</label>
          <input type="date" className={inp} value={form.subscription_expires_at} onChange={e => setForm(p => ({ ...p, subscription_expires_at: e.target.value }))} required />
        </div>
        <div>
          <label className={lbl}>{t("monthlyFeeMad")}</label>
          <input type="number" step="0.01" min="0" className={inp} value={form.monthly_fee} onChange={e => setForm(p => ({ ...p, monthly_fee: e.target.value }))} placeholder="100" />
        </div>
        <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold-deep hover:text-white transition-colors disabled:opacity-50">
          {saving ? t("saving") : t("saveSubscription")}
        </button>
      </form>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AccountDetailPage({ params }: { params: Promise<{ userId: string; locale: string }> }) {
  const { userId } = use(params);
  const t = useTranslations("admin");
  const [data, setData] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");
  const [categories, setCategories] = useState<Category[]>([]);

  // Product edit modal
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    api.get(`/admin/managed-sellers/${userId}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, [userId]);

  const openProductEdit = async (productId: number) => {
    setLoadingProduct(true);
    setEditingProduct(null);
    try {
      const { data: pd } = await api.get(`/admin/products/${productId}`);
      setEditingProduct(pd);
    } catch {}
    setLoadingProduct(false);
  };

  const handleProductSaved = (updated: ProductDetail) => {
    setData(d => d ? {
      ...d,
      products: d.products.map(p => p.id === updated.id ? {
        ...p,
        name: updated.name,
        price: updated.price,
        stock_quantity: updated.stock_quantity,
        is_active: updated.is_active,
        is_approved: updated.is_approved,
      } : p),
    } : d);
    setEditingProduct(updated);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <p className="text-stone">Account not found.</p>;

  const { user, seller, orders, products, conversations } = data;
  const logoUrl = getImageUrl(seller?.logo_path ?? undefined);
  const bannerUrl = getImageUrl(seller?.banner_path ?? undefined);
  const days = daysUntil(user.subscription_expires_at);
  const subExpired = days !== null && days < 0;
  const subUrgent  = days !== null && days >= 0 && days <= 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <Link href="/admin/managed-sellers" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-ink transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        {t("managedAccountsBack")}
      </Link>

      {/* Profile header */}
      <div className="relative bg-white rounded-2xl border border-stone/10 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-sand to-stone/10 relative">
          {bannerUrl && <Image src={bannerUrl} alt="" fill className="object-cover" />}
          <div className="absolute top-3 right-3">
            {subExpired ? (
              <span className="bg-henna text-white text-xs font-bold px-3 py-1 rounded-full">{t("expired")}</span>
            ) : subUrgent ? (
              <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">{t("expiresInDays", { days })}</span>
            ) : user.subscription_expires_at ? (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t("daysRemainingShort", { days: days! })}</span>
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gold/10 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
              {logoUrl ? <Image src={logoUrl} alt={user.name} width={64} height={64} className="object-cover w-full h-full" /> : <span className="text-xl font-bold text-gold-deep">{user.name.charAt(0)}</span>}
            </div>
            <div className="flex-1 min-w-0 pt-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl text-ink">{user.name}</h1>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${user.plan === "premium" ? "bg-ink/10 text-ink" : "bg-gold/15 text-gold-deep"}`}>{user.plan}</span>
                {seller && <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${seller.status === "verified" ? "bg-green-50 text-green-700" : "bg-henna/10 text-henna"}`}>{t(seller.status as "pending" | "verified" | "suspended")}</span>}
              </div>
              <p className="text-sm text-stone">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
              {seller && <p className="text-sm font-medium text-gold-deep mt-0.5">{seller.store_name}</p>}
            </div>
          </div>

          {seller && (
            <div className="flex gap-4 flex-wrap">
              {[
                { v: orders?.length ?? 0, l: "orders" },
                { v: products?.length ?? 0, l: "products" },
                { v: conversations?.filter(c => c.unread_count > 0).length ?? 0, l: "unread convos" },
                { v: orders?.filter(o => o.status === "pending").length ?? 0, l: "pending" },
              ].map(s => (
                <div key={s.l} className="text-center px-4 py-2 bg-sand rounded-xl border border-stone/10">
                  <p className="text-lg font-bold text-ink">{s.v}</p>
                  <p className="text-[10px] text-stone uppercase tracking-wide">{s.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(() => {
        const TAB_LABELS: Record<typeof TABS[number], string> = {
          Overview: t("overview"),
          Store: t("store"),
          Orders: t("orders"),
          Messages: t("conversations"),
          Products: t("products"),
          Subscription: t("subscription"),
        };
        return (
          <div className="flex gap-1 bg-white rounded-xl border border-stone/10 p-1 flex-wrap">
            {TABS.map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${tab === tabKey ? "bg-gold text-ink" : "text-stone hover:text-ink"}`}>
                {TAB_LABELS[tabKey]}
                {tabKey === "Orders" && (orders?.filter(o => o.status === "pending").length ?? 0) > 0 && (
                  <span className="ms-1.5 text-[10px] bg-amber-400 text-white rounded-full px-1.5 py-0.5">{orders.filter(o => o.status === "pending").length}</span>
                )}
                {tabKey === "Messages" && (conversations?.reduce((a, c) => a + c.unread_count, 0) ?? 0) > 0 && (
                  <span className="ms-1.5 text-[10px] bg-violet-500 text-white rounded-full px-1.5 py-0.5">{conversations.reduce((a, c) => a + c.unread_count, 0)}</span>
                )}
                {tabKey === "Subscription" && (subExpired || subUrgent) && (
                  <span className="ms-1.5 text-[10px] bg-henna text-white rounded-full px-1.5 py-0.5">!</span>
                )}
                {tabKey === "Store" && !seller && (
                  <span className="ms-1.5 text-[10px] bg-henna text-white rounded-full px-1.5 py-0.5">!</span>
                )}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Tab content */}
      <div>
        {/* OVERVIEW */}
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-stone/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-ink">{t("storeInfo")}</h3>
                <button onClick={() => setTab("Store")}
                  className="text-xs text-gold-deep hover:underline font-medium">
                  {seller ? t("editStore") : t("createStore")} →
                </button>
              </div>
              {!seller ? (
                <p className="text-sm text-stone italic">{t("noStoreCreated")}</p>
              ) : (
                <dl className="space-y-2 text-sm">
                  {[[t("storeName"), seller.store_name], [t("phone"), seller.phone_number ?? "—"], [t("bankName"), seller.bank_name ?? "—"], [t("bankAccount"), seller.bank_account_number ?? "—"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between gap-2"><dt className="text-stone">{l}</dt><dd className="text-ink font-medium text-right">{v}</dd></div>
                  ))}
                  {seller.store_description && <div><dt className="text-stone mb-1">{t("description")}</dt><dd className="text-ink text-xs">{seller.store_description}</dd></div>}
                </dl>
              )}
            </div>
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-stone/10 p-5 space-y-3">
              <h3 className="font-semibold text-sm text-ink">{t("recentOrders")}</h3>
              {!orders?.length ? <p className="text-sm text-stone italic">{t("noOrdersYet")}</p> : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-ink truncate">{o.customer?.name ?? "—"}</p><p className="text-[10px] text-stone">{timeAgo(o.created_at)}</p></div>
                      <OrderStatusBadge status={o.status} />
                      <span className="text-xs font-semibold text-ink shrink-0">{Number(o.total_price).toLocaleString()} MAD</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STORE */}
        {tab === "Store" && (
          <div className="bg-white rounded-2xl border border-stone/10 p-6">
            <StoreEditPanel
              userId={userId}
              seller={seller}
              onSaved={(updated) => setData(d => d ? { ...d, seller: updated } : d)}
            />
          </div>
        )}

        {/* ORDERS */}
        {tab === "Orders" && (
          <div className="bg-white rounded-2xl border border-stone/10 overflow-hidden">
            {!orders?.length ? <p className="text-sm text-stone italic p-6">{t("noOrdersYet")}</p> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stone/10 text-[10px] uppercase tracking-wider text-stone">
                  <th className="text-left px-4 py-3">Customer</th><th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Amount</th><th className="text-right px-4 py-3">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-stone/10">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-sand/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{o.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold">{Number(o.total_price).toLocaleString()} MAD</td>
                      <td className="px-4 py-3 text-right text-stone text-xs">{timeAgo(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "Messages" && (
          <div className="space-y-2">
            {!conversations?.length ? <p className="text-sm text-stone italic">{t("noConversationsYet")}</p> : conversations.map(c => {
              const av = getImageUrl(c.buyer?.avatar_path ?? undefined);
              return (
                <Link key={c.id} href={`/admin/conversations/${c.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-stone/10 px-4 py-3 hover:border-gold/30 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gold/10 border border-gold/20 shrink-0 flex items-center justify-center">
                    {av ? <Image src={av} alt="" width={36} height={36} className="object-cover w-full h-full" /> : <span className="text-xs font-bold text-gold-deep">{(c.buyer?.name ?? "?").charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{c.buyer?.name ?? "Unknown"}</p>
                    {c.product && <p className="text-xs text-stone truncate">{c.product.name}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.unread_count > 0 && <span className="text-[10px] font-bold bg-violet-500 text-white rounded-full px-1.5 py-0.5">{c.unread_count}</span>}
                    <span className="text-[10px] text-stone">{timeAgo(c.last_message_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "Products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone">{t("productCountLabel", { count: products?.length ?? 0 })}</p>
            </div>
            {!products?.length ? <p className="text-sm text-stone italic">{t("noProductsYet")}</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map(p => {
                  const imgUrl = getImageUrl(p.primary_image?.image_path);
                  return (
                    <button
                      key={p.id}
                      onClick={() => openProductEdit(p.id)}
                      className="bg-white rounded-2xl border border-stone/10 overflow-hidden text-left hover:border-gold/40 hover:shadow-md transition-all group"
                    >
                      <div className="aspect-square bg-sand relative">
                        {imgUrl
                          ? <Image src={imgUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="absolute inset-0 flex items-center justify-center text-stone/30"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        }
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {!p.is_approved && <span className="text-[9px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">{t("pending")}</span>}
                          {!p.is_active && <span className="text-[9px] bg-stone text-white px-1.5 py-0.5 rounded-full font-bold">{t("hidden")}</span>}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-ink text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                            {t("edit")}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-ink line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gold-deep font-bold mt-1">{Number(p.price).toLocaleString()} MAD</p>
                        <p className="text-[10px] text-stone mt-0.5">Stock: {p.stock_quantity}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab === "Subscription" && (
          <SubscriptionPanel user={user} onUpdated={u => setData(d => d ? { ...d, user: u } : d)} />
        )}
      </div>

      {/* Product edit modal */}
      <Modal
        open={editingProduct !== null || loadingProduct}
        onClose={() => { setEditingProduct(null); }}
        title={editingProduct ? `Edit — ${editingProduct.name}` : "Loading…"}
        maxWidth="max-w-2xl"
        noPadding
      >
        {loadingProduct ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : editingProduct ? (
          <ProductEditModal
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onSaved={handleProductSaved}
          />
        ) : null}
      </Modal>
    </div>
  );
}
