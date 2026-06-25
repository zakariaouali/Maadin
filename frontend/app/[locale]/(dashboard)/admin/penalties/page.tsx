"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge, Button, Modal, PageHeader, Spinner, Alert } from "@/components/ui";

interface Penalty {
  id: number;
  seller: { id: number; store_name: string; name: string };
  type: "warning" | "suspension" | "ban";
  reason: string;
  description: string;
  duration_days: number | null;
  expires_at: string | null;
  issued_by: { name: string };
  created_at: string;
}

interface Seller {
  id: number;
  store_name: string;
  name: string;
}

const PENALTY_TYPE_VARIANTS: Record<string, "warning" | "danger" | "info"> = {
  warning: "warning",
  suspension: "danger",
  ban: "danger",
};

const PENALTY_TYPE_COLORS: Record<string, string> = {
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  suspension: "text-orange-700 bg-orange-50 border-orange-200",
  ban: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminPenaltiesPage() {
  const t = useTranslations("admin");

  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    seller_id: "",
    type: "warning" as "warning" | "suspension" | "ban",
    reason: "fake_stock",
    description: "",
    duration_days: "",
  });

  const fetchPenalties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/penalties");
      setPenalties(res.data?.data ?? res.data ?? []);
    } catch {
      setError("Failed to load penalties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPenalties();
  }, [fetchPenalties]);

  const handleOpenModal = async () => {
    setModalOpen(true);
    if (sellers.length === 0) {
      setSellersLoading(true);
      try {
        const res = await api.get("/admin/sellers");
        setSellers(res.data?.data ?? res.data ?? []);
      } catch {
        // ignore
      } finally {
        setSellersLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/admin/penalties", {
        seller_id: Number(form.seller_id),
        type: form.type,
        reason: form.reason,
        description: form.description,
        duration_days: form.type === "suspension" && form.duration_days
          ? Number(form.duration_days)
          : null,
      });
      setSuccess(t("penaltyIssued"));
      setModalOpen(false);
      setForm({ seller_id: "", type: "warning", reason: "fake_stock", description: "", duration_days: "" });
      fetchPenalties();
    } catch {
      setError("Failed to issue penalty.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("penalties")}
        action={
          <Button variant="primary" onClick={handleOpenModal}>
            {t("issuePenalty")}
          </Button>
        }
      />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : penalties.length === 0 ? (
          <p className="text-center text-stone py-16 text-sm">{t("noPenalties")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/20 bg-sand">
                <th className="text-left px-4 py-3 text-stone font-medium">{t("seller")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("penaltyType")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("reason")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("issuedBy")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">Issued</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("expiresAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {penalties.map((p) => (
                <tr key={p.id} className="hover:bg-sand/50 transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">
                    {p.seller.store_name ?? p.seller.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium ${PENALTY_TYPE_COLORS[p.type] ?? ""}`}
                    >
                      {p.type ? t(p.type === "ban" ? "penaltyBan" : p.type) : p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone capitalize">
                    {p.reason.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-stone">{p.issued_by?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-stone">
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Issue Penalty Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t("issuePenalty")}
        maxWidth="md"
      >
        {sellersLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Seller */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">{t("seller")}</label>
              <select
                required
                value={form.seller_id}
                onChange={(e) => setForm((f) => ({ ...f, seller_id: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
              >
                <option value="">— Select seller —</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.store_name ?? s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Penalty type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">{t("penaltyType")}</label>
              <div className="flex gap-3">
                {(["warning", "suspension", "ban"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={form.type === type}
                      onChange={() => setForm((f) => ({ ...f, type }))}
                      className="accent-gold-deep"
                    />
                    <span className="text-sm text-ink">
                      {t(type === "ban" ? "penaltyBan" : type)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">{t("reason")}</label>
              <select
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
              >
                <option value="fake_stock">{t("fakeStock")}</option>
                <option value="delayed_order">{t("delayedOrder")}</option>
                <option value="bad_behavior">{t("badBehavior")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">{t("penaltyDesc")}</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
              />
            </div>

            {/* Duration (suspension only) */}
            {form.type === "suspension" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">{t("durationDays")}</label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(e) => setForm((f) => ({ ...f, duration_days: e.target.value }))}
                  className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
                  placeholder="e.g. 7"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {t("save")}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
