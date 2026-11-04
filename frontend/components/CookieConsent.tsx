"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "martisana-cookie-consent";
/** Fired by the footer's "Cookie settings" link to ask the banner to open again */
export const OPEN_COOKIE_SETTINGS_EVENT = "martisana:open-cookie-settings";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

// "granted" | "denied" | "" (no choice yet). The server cannot know, so it reports "pending"
// and the banner stays hidden until the browser has read its own storage (no flash, no mismatch).
function getSnapshot(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
}
const getServerSnapshot = () => "pending";

function saveChoice(choice: "granted" | "denied") {
  try { localStorage.setItem(STORAGE_KEY, choice); } catch { /* private mode: the choice just won't be remembered */ }
  listeners.forEach((l) => l());
}

/**
 * Asks for cookie consent and only loads Google Analytics after "Accept"
 * (Moroccan law 09-08 and the GDPR for EU visitors require consent first).
 */
export function CookieConsent({ gaId }: { gaId?: string }) {
  const t = useTranslations("ui");
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  const decide = (value: "granted" | "denied") => {
    saveChoice(value);
    setReopened(false);
  };

  const showBanner = choice === "" || (reopened && choice !== "pending");

  return (
    <>
      {choice === "granted" && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-body"
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-gold/30 bg-ink text-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p id="cookie-title" className="text-sm font-semibold">{t("cookieTitle")}</p>
              <p id="cookie-body" className="mt-1 text-sm text-white/70">
                {t("cookieBody")}{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-gold">{t("cookieLearnMore")}</Link>
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-h-[44px] rounded-sm border border-white/30 px-5 text-sm font-medium text-white transition-colors hover:border-white/60"
              >
                {t("cookieDecline")}
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-h-[44px] rounded-sm bg-gold px-5 text-sm font-semibold text-ink transition-colors hover:bg-gold-deep hover:text-white"
              >
                {t("cookieAccept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
