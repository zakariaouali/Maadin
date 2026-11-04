"use client";

import { useTranslations } from "next-intl";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/CookieConsent";

/** Footer link that lets a visitor change or withdraw their cookie choice */
export default function CookieSettingsLink() {
  const t = useTranslations("ui");
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="inline-block py-2 hover:text-white/60 transition-colors"
    >
      {t("cookieSettings")}
    </button>
  );
}
