"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api, { apiErrorMessage } from "@/lib/api";
import { Alert, Button, PageHeader, Spinner } from "@/components/ui";
import { formatDateTime } from "@/lib/i18n-helpers";
import { AUDIT_ACTIONS, AUDIT_SUBJECTS, useAuditLabels } from "@/components/admin/auditLabels";

interface LogEntry {
  id: number;
  action: string;
  subject_type: string;
  subject_id: number;
  changes: Record<string, unknown> | null;
  created_at: string;
  admin: { id: number; name: string } | null;
}

interface Page {
  data: LogEntry[];
  current_page: number;
  last_page: number;
  total: number;
  filters: { actions: string[]; subject_types: string[] };
}

const emptyFilters = { action: "", subject_type: "", from: "", to: "" };

export default function AdminAuditPage() {
  const t = useTranslations("admin");
  const label = useAuditLabels();

  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [loaded, setLoaded] = useState({ key: "" });
  const [error, setError] = useState("");

  const queryKey = JSON.stringify([filters, page]);
  const loading = loaded.key !== queryKey;

  useEffect(() => {
    let alive = true;
    const params: Record<string, string | number> = { page };
    (Object.keys(filters) as (keyof typeof filters)[]).forEach((k) => { if (filters[k]) params[k] = filters[k]; });
    api.get("/admin/audit-logs", { params })
      .then(({ data }) => { if (alive) { setResult(data); setError(""); } })
      .catch((e) => { if (alive) setError(apiErrorMessage(e, t("failedAction"))); })
      .finally(() => { if (alive) setLoaded({ key: queryKey }); });
    return () => { alive = false; };
  }, [queryKey, filters, page, t]);

  const setFilter = (k: keyof typeof filters, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const field = "border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep bg-white";
  const filtersActive = Object.values(filters).some(Boolean);

  // offer every known action, plus any the server has seen that this screen does not know yet
  const actionOptions = Array.from(new Set([...AUDIT_ACTIONS, ...(result?.filters.actions ?? [])]));
  const subjectOptions = Array.from(new Set([...AUDIT_SUBJECTS, ...(result?.filters.subject_types ?? [])]));

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader title={t("auditTitle")} />
      <p className="text-sm text-stone -mt-3">{t("auditIntro")}</p>

      {error && <Alert type="error">{error}</Alert>}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="f_action" className="text-xs text-stone">{t("auditAction")}</label>
          <select id="f_action" className={field} value={filters.action} onChange={(e) => setFilter("action", e.target.value)}>
            <option value="">{t("auditAllActions")}</option>
            {actionOptions.map((a) => <option key={a} value={a}>{label.action(a)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_type" className="text-xs text-stone">{t("auditSubject")}</label>
          <select id="f_type" className={field} value={filters.subject_type} onChange={(e) => setFilter("subject_type", e.target.value)}>
            <option value="">{t("auditAllTypes")}</option>
            {subjectOptions.map((s) => <option key={s} value={s}>{label.subject(s)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_from" className="text-xs text-stone">{t("auditFrom")}</label>
          <input id="f_from" type="date" className={field} value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f_to" className="text-xs text-stone">{t("auditTo")}</label>
          <input id="f_to" type="date" className={field} value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
        </div>
        {filtersActive && <Button variant="ghost" size="sm" onClick={() => { setFilters(emptyFilters); setPage(1); }}>{t("auditClear")}</Button>}
      </div>

      {loading && !result ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !result || result.data.length === 0 ? (
        <p className="text-stone text-sm py-10 text-center">{t("auditNone")}</p>
      ) : (
        <>
          <div className={`bg-white border border-stone/20 rounded-sm divide-y divide-stone/10 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {result.data.map((l) => {
              const summary = label.changes(l.changes);
              return (
                <div key={l.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium text-ink">{label.action(l.action)}</p>
                    <p className="text-xs text-stone">{formatDateTime(l.created_at)}</p>
                  </div>
                  <p className="text-xs text-stone mt-0.5">
                    {l.admin?.name ?? "—"} · {label.subject(l.subject_type)}{" "}
                    {l.subject_type === "user"
                      ? <Link href={`/admin/users/${l.subject_id}`} className="text-gold-deep hover:underline">#{l.subject_id}</Link>
                      : <span>#{l.subject_id}</span>}
                  </p>
                  {summary && <p className="text-xs text-stone/80 mt-1 break-words" dir="auto">{summary}</p>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-stone">{t("auditTotal", { count: result.total })}</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>{t("auditPrev")}</Button>
              <span className="text-xs text-stone">{t("auditPage", { page: result.current_page, total: result.last_page })}</span>
              <Button variant="secondary" size="sm" disabled={page >= result.last_page || loading} onClick={() => setPage((p) => p + 1)}>{t("auditNext")}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
