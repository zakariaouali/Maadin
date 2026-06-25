"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { getImageUrl, normalizeImageFile } from "@/lib/image";
import { Alert, Badge, Button, EmptyState, Input, Modal, PageHeader, Spinner } from "@/components/ui";

const MAX_IMAGES = 5;

interface Category { id: number; name: string; }
interface ProductImage { id: number; image_path: string; is_primary: boolean; }
interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  is_approved: boolean;
  category?: { id: number; name: string };
  images?: ProductImage[];
}

const emptyForm = { name: "", description: "", price: "", stock: "", category_id: "", sku: "", is_active: true };

export default function SellerProductsPage() {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeStatus, setStoreStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Image management modal
  const [imagesProductId, setImagesProductId] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images selected inside the create form
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [formFilePreviews, setFormFilePreviews] = useState<string[]>([]);
  const formFileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = storeStatus === "verified";

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/seller/products"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      try {
        const sRes = await api.get("/seller/store");
        setStoreStatus(sRes.data?.status ?? null);
      } catch {
        setStoreStatus(null); // no store yet
      }
    } catch (e: any) {
      setError(e.response?.data?.message || t("failedLoadData"));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadImages = async (productId: number) => {
    const { data } = await api.get(`/seller/products/${productId}`);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, images: data.images } : p)));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormFiles([]);
    setFormFilePreviews([]);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: "",
      price: p.price,
      stock: String(p.stock_quantity),
      category_id: String(p.category?.id ?? ""),
      sku: "",
      is_active: p.is_active,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock_quantity: Number(form.stock),
      category_id: Number(form.category_id),
      sku: form.sku || undefined,
      is_active: form.is_active,
    };
    try {
      if (editingId) {
        await api.put(`/seller/products/${editingId}`, payload);
        setSuccess(t("productUpdated"));
        await load();
        closeForm();
      } else {
        const { data: newProduct } = await api.post("/seller/products", payload);
        if (formFiles.length > 0) {
          const fd = new FormData();
          formFiles.forEach((f) => fd.append("images[]", normalizeImageFile(f)));
          await api.post(`/seller/products/${newProduct.id}/images`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        setSuccess(t("productCreated"));
        await load();
        closeForm();
      }
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(" ") : err.response?.data?.message || t("failedSave"));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    setError("");
    try {
      await api.delete(`/seller/products/${id}`);
      setSuccess(t("productDeleted"));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || t("failedDelete"));
    }
  };

  const openImages = async (productId: number) => {
    setImagesProductId(productId);
    await loadImages(productId);
  };

  const currentImages = products.find((p) => p.id === imagesProductId)?.images ?? [];
  const canUploadMore = currentImages.length < MAX_IMAGES;

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !imagesProductId) return;
    const remaining = MAX_IMAGES - currentImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;
    setUploadingImages(true);
    const fd = new FormData();
    toUpload.forEach((f) => fd.append("images[]", normalizeImageFile(f)));
    try {
      await api.post(`/seller/products/${imagesProductId}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadImages(imagesProductId);
    } catch (err: any) {
      setError(err.response?.data?.message || t("uploadFailed"));
    }
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

  };

  const handleSetPrimary = async (imageId: number) => {
    if (!imagesProductId) return;
    await api.put(`/seller/products/${imagesProductId}/images/${imageId}/primary`);
    await loadImages(imagesProductId);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!imagesProductId) return;
    setDeletingImageId(imageId);
    await api.delete(`/seller/products/${imagesProductId}/images/${imageId}`);
    await loadImages(imagesProductId);
    setDeletingImageId(null);
  };

  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    setFormFiles((prev) => {
      const combined = [...prev, ...incoming].slice(0, MAX_IMAGES);
      setFormFilePreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
    // reset input so the same file can be picked again if needed
    e.target.value = "";
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={t("myProducts")}
        action={
          isVerified ? (
            <Button variant="primary" onClick={openCreate}>{t("addProduct")}</Button>
          ) : (
            <span className="text-xs text-stone bg-stone/10 rounded-full px-3 py-1.5">
              {t("notVerified").split(".")[0]}
            </span>
          )
        }
      />

      {/* Verification notice */}
      {!isVerified && (
        <div className="mb-6 rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/8 px-5 py-4 flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-[#9c7a1a] leading-relaxed">{t("notVerified")}</p>
        </div>
      )}

      {success && <Alert type="success" className="mb-4">{success}</Alert>}
      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {products.length === 0 ? (
        <EmptyState
          title={t("noProducts")}
          action={isVerified ? <Button variant="primary" onClick={openCreate}>{t("addProduct")}</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const primaryImage = p.images?.find((i) => i.is_primary) ?? p.images?.[0];
            const imageUrl = getImageUrl(primaryImage?.image_path);

            return (
              <div key={p.id} className="bg-white border border-stone/20 rounded-sm flex items-center gap-4 p-4">
                <div className="relative w-14 h-14 shrink-0 bg-sand-dark rounded-sm overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={p.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-stone mt-0.5">
                    {p.category?.name} · {p.price} MAD · Stock: {p.stock_quantity}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Approval status */}
                  {p.is_approved ? (
                    <Badge variant="success">Approved</Badge>
                  ) : (
                    <Badge variant="warning">Pending review</Badge>
                  )}
                  {/* Visibility — only relevant once approved */}
                  {p.is_approved && (
                    <Badge variant={p.is_active ? "default" : "default"} className={p.is_active ? "text-stone" : "opacity-50"}>
                      {p.is_active ? t("active") : t("hidden")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => openImages(p.id)}>
                    {t("images")} {p.images ? `(${p.images.length}/${MAX_IMAGES})` : ""}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                    {tCommon("edit")}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                    {tCommon("delete")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={showForm} onClose={closeForm} title={editingId ? t("editProduct") : t("addProduct")} maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-stone">{t("productCategory")}</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              required
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep bg-white"
            >
              <option value="">— {t("productCategory")} —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input label={t("productName")} id="p_name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-stone font-medium">{t("productDescription")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={6}
              required
              placeholder="Describe your product — materials, dimensions, technique, what makes it special..."
              className="w-full border border-stone/30 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/20 resize-y transition-colors bg-sand/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t("productPrice")} id="p_price" type="number" step="0.01" min="0.01"
              value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            <Input label={t("productStock")} id="p_stock" type="number" min="0"
              value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
          </div>

          <Input label={t("productSku")} id="p_sku" value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />

          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="accent-gold-deep"
            />
            {t("productActive")}
          </label>

          {/* Image upload — create only, max 5 */}
          {!editingId && (
            <div>
              <p className="text-sm text-stone mb-2">
                {t("uploadImages")} <span className="text-stone/50">({t("optional")} · max {MAX_IMAGES})</span>
              </p>
              {formFiles.length < MAX_IMAGES && (
                <div
                  className="border-2 border-dashed border-stone/30 rounded-sm p-4 text-center cursor-pointer hover:border-gold transition-colors"
                  onClick={() => formFileInputRef.current?.click()}
                >
                  <svg className="mx-auto mb-1 text-stone/40" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-xs text-stone">{t("clickToSelectImages")}</p>
                </div>
              )}
              <input
                ref={formFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFormFileChange}
              />
              {formFilePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {formFilePreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-sm overflow-hidden border border-stone/20">
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 text-[9px] bg-gold/90 text-white text-center py-0.5 z-10">
                          {t("primary")}
                        </span>
                      )}
                      <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormFiles((prev) => prev.filter((_, j) => j !== i));
                          setFormFilePreviews((prev) => prev.filter((_, j) => j !== i));
                        }}
                        className="absolute top-0.5 right-0.5 bg-henna text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none z-10"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              {t("saveProduct")}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm}>
              {tCommon("cancel")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image management modal */}
      <Modal
        open={imagesProductId !== null}
        onClose={() => setImagesProductId(null)}
        title={t("uploadImages")}
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col gap-4">
          {/* Slot count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone">
              {currentImages.length} / {MAX_IMAGES} images
            </p>
            {!canUploadMore && (
              <span className="text-xs text-henna font-medium">Maximum reached</span>
            )}
          </div>

          {/* Upload area — hidden when at limit */}
          {canUploadMore && (
            <div
              className="border-2 border-dashed border-stone/30 rounded-sm p-6 text-center cursor-pointer hover:border-gold transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImages ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <svg className="mx-auto mb-2 text-stone/50" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-stone">{t("uploadImages")}</p>
                  <p className="text-xs text-stone/60 mt-1">{t("imageHint")}</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />

          {/* Image grid */}
          {currentImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {currentImages.map((img) => {
                const url = getImageUrl(img.image_path);
                return (
                  <div key={img.id} className="relative group">
                    <div className={`relative aspect-square rounded-sm overflow-hidden border-2 ${img.is_primary ? "border-gold" : "border-transparent"}`}>
                      {url && <Image src={url} alt="" fill className="object-cover" sizes="120px" />}
                    </div>
                    {img.is_primary && (
                      <span className="absolute top-1 start-1 text-[10px] bg-gold text-white px-1.5 py-0.5 rounded-sm">
                        {t("primary")}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col items-center justify-center gap-2">
                      {!img.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          className="text-[10px] text-white bg-gold px-2.5 py-1.5 rounded-sm font-medium"
                        >
                          {t("setPrimary")}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingImageId === img.id}
                        className="text-[10px] text-white bg-henna px-2.5 py-1.5 rounded-sm font-medium disabled:opacity-50"
                      >
                        {tCommon("delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
