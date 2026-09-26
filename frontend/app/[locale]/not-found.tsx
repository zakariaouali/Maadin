import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <p className="font-display text-8xl text-gold/40 select-none">404</p>
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-ink">{t("notFoundTitle")}</h1>
          <p className="text-stone leading-relaxed">
            {t("notFoundDesc")}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-deep text-ink font-medium px-6 py-2.5 rounded-sm transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
