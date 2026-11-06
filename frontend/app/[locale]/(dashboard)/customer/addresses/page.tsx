"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api, { apiErrorMessage } from "@/lib/api";
import { Alert, Badge, Button, Input, PageHeader, Spinner } from "@/components/ui";

export interface SavedAddress {
  id: number;
  label: string | null;
  address: string;
  city: string;
  phone: string;
  postal_code: string | null;
  is_default: boolean;
}

const empty = { label: "", address: "", city: "", phone: "", postal_code: "", is_default: false };

export default function CustomerAddressesPage() {
  const t = useTranslations("addresses");
  const tCommon = useTranslations("common");

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    api.get("/customer/addresses")
      .then(({ data }) => { if (alive) setAddresses(data); })
      .catch((e) => { if (alive) setError(apiErrorMessage(e, t("failed"))); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [version, t]);

  const reload = () => setVersion((v) => v + 1);
  const set = (k: keyof typeof empty, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setForm({ ...empty, is_default: addresses.length === 0 }); setEditingId("new"); setError(""); setNotice(""); };
  const openEdit = (a: SavedAddress) => {
    setForm({ label: a.label ?? "", address: a.address, city: a.city, phone: a.phone, postal_code: a.postal_code ?? "", is_default: a.is_default });
    setEditingId(a.id); setError(""); setNotice("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const body = { ...form, label: form.label || null, postal_code: form.postal_code || null };
    try {
      if (editingId === "new") await api.post("/customer/addresses", body);
      else await api.put(`/customer/addresses/${editingId}`, body);
      setEditingId(null);
      setNotice(t("saved"));
      reload();
    } catch (err) {
      setError(apiErrorMessage(err, t("failed")));
    }
    setSaving(false);
  };

  const makeDefault = async (a: SavedAddress) => {
    setError(""); setNotice("");
    try {
      await api.put(`/customer/addresses/${a.id}`, { label: a.label, address: a.address, city: a.city, phone: a.phone, postal_code: a.postal_code, is_default: true });
      reload();
    } catch (err) {
      setError(apiErrorMessage(err, t("failed")));
    }
  };

  const remove = async (id: number) => {
    setError(""); setNotice("");
    try {
      await api.delete(`/customer/addresses/${id}`);
      setConfirmDelete(null);
      setNotice(t("deleted"));
      reload();
    } catch (err) {
      setError(apiErrorMessage(err, t("failed")));
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title={t("title")} />
      <p className="text-sm text-stone -mt-3">{t("subtitle")}</p>

      {error && <Alert type="error">{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          {addresses.length === 0 && editingId === null && (
            <div className="bg-white border border-stone/20 rounded-sm p-8 text-center">
              <p className="text-stone text-sm mb-4">{t("empty")}</p>
              <Button onClick={openNew}>{t("add")}</Button>
            </div>
          )}

          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="bg-white border border-stone/20 rounded-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p className="flex items-center gap-2 font-medium text-ink">
                      {a.label || t("addressFallback")}
                      {a.is_default && <Badge variant="gold">{t("defaultBadge")}</Badge>}
                    </p>
                    <p className="text-stone mt-1" dir="auto">{a.address}{a.postal_code ? `, ${a.postal_code}` : ""}, {a.city}</p>
                    <p className="text-stone" dir="ltr">{a.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-xs shrink-0">
                    <button onClick={() => openEdit(a)} className="text-gold-deep hover:underline font-medium">{tCommon("edit")}</button>
                    {!a.is_default && <button onClick={() => makeDefault(a)} className="text-stone hover:text-ink hover:underline">{t("makeDefault")}</button>}
                    {confirmDelete === a.id ? (
                      <span className="flex items-center gap-2">
                        <button onClick={() => remove(a.id)} className="text-henna hover:underline font-medium">{t("deleteYes")}</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-stone hover:underline">{tCommon("cancel")}</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDelete(a.id)} className="text-henna hover:underline">{t("delete")}</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {addresses.length > 0 && editingId === null && (
            <Button variant="secondary" onClick={openNew}>{t("add")}</Button>
          )}

          {editingId !== null && (
            <form onSubmit={save} className="bg-white border border-stone/20 rounded-sm p-5 space-y-4">
              <h2 className="font-display text-lg text-ink">{editingId === "new" ? t("add") : t("edit")}</h2>
              <Input label={t("label")} id="a_label" value={form.label} maxLength={50} placeholder={t("labelPlaceholder")} onChange={(e) => set("label", e.target.value)} />
              <Input label={t("address")} id="a_address" value={form.address} maxLength={255} required placeholder="123 Rue Mohammed V" onChange={(e) => set("address", e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t("city")} id="a_city" value={form.city} maxLength={100} required placeholder="Marrakech" onChange={(e) => set("city", e.target.value)} />
                <Input label={t("postalCode")} id="a_postal" value={form.postal_code} maxLength={10} onChange={(e) => set("postal_code", e.target.value)} />
              </div>
              <Input label={t("phone")} id="a_phone" type="tel" value={form.phone} maxLength={20} required placeholder="06XXXXXXXX" onChange={(e) => set("phone", e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.is_default} onChange={(e) => set("is_default", e.target.checked)} className="accent-gold-deep" />
                {t("makeDefault")}
              </label>
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>{t("save")}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>{tCommon("cancel")}</Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
