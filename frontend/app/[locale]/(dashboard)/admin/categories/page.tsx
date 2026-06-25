"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import api from "@/lib/api";
import { getImageUrl, normalizeImageFile } from "@/lib/image";
import { Badge, Button, Modal, PageHeader, Spinner, Alert } from "@/components/ui";

interface Category {
  id: number;
  name: string;
  name_fr: string | null;
  name_ar: string | null;
  description: string | null;
  icon_path: string | null;
  parent_id: number | null;
  display_order: number;
  is_active: boolean;
  subcategories_count?: number;
}

interface FormState {
  name: string;
  name_fr: string;
  name_ar: string;
  description: string;
  parent_id: string;
  display_order: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  name_fr: "",
  name_ar: "",
  description: "",
  parent_id: "",
  display_order: "0",
  is_active: true,
};

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data?.data ?? res.data ?? []);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const rootCats = categories.filter((c) => !c.parent_id);
  const rows: Array<{ cat: Category; depth: number }> = [];
  rootCats.forEach((root) => {
    rows.push({ cat: root, depth: 0 });
    categories.filter((c) => c.parent_id === root.id).forEach((child) => rows.push({ cat: child, depth: 1 }));
  });
  const topLevelCats = categories.filter((c) => !c.parent_id);

  const openModal = (cat?: Category) => {
    setEditTarget(cat ?? null);
    setForm(cat ? {
      name: cat.name,
      name_fr: cat.name_fr ?? "",
      name_ar: cat.name_ar ?? "",
      description: cat.description ?? "",
      parent_id: cat.parent_id ? String(cat.parent_id) : "",
      display_order: String(cat.display_order),
      is_active: cat.is_active,
    } : EMPTY_FORM);
    setImageFile(null);
    setImagePreview(cat?.icon_path ? getImageUrl(cat.icon_path) ?? null : null);
    setModalOpen(true);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const normalized = normalizeImageFile(file);
    setImageFile(normalized);
    setImagePreview(URL.createObjectURL(normalized));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.name_fr) fd.append("name_fr", form.name_fr);
      if (form.name_ar) fd.append("name_ar", form.name_ar);
      if (form.description) fd.append("description", form.description);
      if (form.parent_id) fd.append("parent_id", form.parent_id);
      fd.append("display_order", form.display_order);
      fd.append("is_active", form.is_active ? "1" : "0");
      if (imageFile) fd.append("image", imageFile);

      if (editTarget) {
        fd.append("_method", "PUT");
        await api.post(`/admin/categories/${editTarget.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess(t("categoryUpdated"));
      } else {
        await api.post("/admin/categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess(t("categoryCreated"));
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      setError("Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.put(`/admin/categories/${cat.id}`, { is_active: !cat.is_active });
      fetchCategories();
    } catch {
      setError("Failed to update category.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/categories/${deleteId}`);
      setSuccess(t("categoryDeleted"));
      setDeleteId(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? t("cantDelete"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("categories")}
        action={<Button variant="primary" onClick={() => openModal()}>{t("newCategory")}</Button>}
      />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-stone py-16 text-sm">{t("noCategories")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/20 bg-sand">
                <th className="text-left px-4 py-3 text-stone font-medium w-12"></th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("name")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium hidden md:table-cell">{t("description")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium hidden sm:table-cell">{t("subcategories")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium hidden sm:table-cell">{t("displayOrder")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {rows.map(({ cat, depth }) => {
                const imgUrl = getImageUrl(cat.icon_path);
                return (
                  <tr key={cat.id} className="hover:bg-sand/50 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-sand border border-stone/20 shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={cat.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-stone/30 text-lg">◈</span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-ink font-medium">
                      <span style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1.5">
                        {depth > 0 && <span className="text-stone/40 text-xs">↳</span>}
                        <span>
                          {cat.name}
                          {(cat.name_fr || cat.name_ar) && (
                            <span className="block text-[10px] text-stone font-normal mt-0.5">
                              {cat.name_fr && <span>{cat.name_fr}</span>}
                              {cat.name_fr && cat.name_ar && <span className="mx-1">·</span>}
                              {cat.name_ar && <span dir="rtl">{cat.name_ar}</span>}
                            </span>
                          )}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-stone max-w-xs truncate hidden md:table-cell">
                      {cat.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-stone text-center hidden sm:table-cell">
                      {cat.subcategories_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-stone text-center hidden sm:table-cell">
                      {cat.display_order}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.is_active ? "success" : "default"}>
                        {cat.is_active ? t("active") : t("inactive")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(cat)}>
                          {cat.is_active ? t("deactivate") : t("activate")}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openModal(cat)}>
                          {t("edit")}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => { setDeleteId(cat.id); setDeleteError(null); }}>
                          {t("delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? t("editCategory") : t("newCategory")}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">{t("categoryImage")}</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-stone/25 rounded-sm hover:border-gold transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <div className="relative h-36 w-full">
                  <Image src={imagePreview} alt="preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-sm">Change image</span>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-stone">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs">{t("categoryImageHint")}</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPickImage}
            />
          </div>

          {/* Names */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">{t("name")} (English) *</label>
              <input required type="text" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Nom (Français)</label>
              <input type="text" value={form.name_fr}
                onChange={(e) => setForm((f) => ({ ...f, name_fr: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">الاسم (العربية)</label>
              <input type="text" dir="rtl" value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">{t("description")}</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
            />
          </div>

          {/* Parent */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">{t("parentCategory")}</label>
            <select
              value={form.parent_id}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
              className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
            >
              <option value="">— No parent (top level) —</option>
              {topLevelCats
                .filter((c) => !editTarget || c.id !== editTarget.id)
                .map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Display order */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink">{t("displayOrder")}</label>
            <input
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
              className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="accent-gold-deep w-4 h-4"
            />
            <span className="text-sm text-ink">{t("active")}</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {t("save")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title={t("delete")}>
        {deleteError ? (
          <Alert type="error">{deleteError}</Alert>
        ) : (
          <p className="text-sm text-stone mb-6">Are you sure you want to delete this category?</p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>{t("cancel")}</Button>
          {!deleteError && (
            <Button variant="danger" loading={deleting} onClick={handleDelete}>{t("delete")}</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
