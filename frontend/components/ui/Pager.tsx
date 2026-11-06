"use client";

import { useTranslations } from "next-intl";

/** Previous / next controls for a list the server returns one page at a time. Renders nothing for a single page. */
export function Pager({ page, lastPage, total, onChange }: { page: number; lastPage: number; total?: number; onChange: (page: number) => void }) {
  const t = useTranslations("ui");
  if (lastPage <= 1) return null;

  const btn = "px-4 py-2 text-sm border border-stone/20 rounded-lg hover:bg-sand disabled:opacity-40 transition-colors bg-white";
  return (
    <nav aria-label="pagination" className="flex items-center justify-center gap-3 pt-4">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>{t("prev")}</button>
      <span className="text-sm text-stone">
        {page} / {lastPage}
        {typeof total === "number" && <span className="text-stone/60"> · {total}</span>}
      </span>
      <button type="button" className={btn} disabled={page >= lastPage} onClick={() => onChange(page + 1)}>{t("next")}</button>
    </nav>
  );
}
