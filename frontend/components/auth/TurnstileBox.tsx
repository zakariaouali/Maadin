"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

/** True once NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; until then forms work without the human check. */
export const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

/**
 * Cloudflare Turnstile ("are you a human") box. Calls onToken with a one-time token when the visitor passes,
 * and with "" when it expires. Change resetKey after a failed submit to get a fresh box and a fresh token.
 */
export function TurnstileBox({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    let widgetId: string | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const mount = () => {
      if (!holder.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(holder.current, {
        sitekey: siteKey,
        language: "auto",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (window.turnstile) mount();
    else timer = setInterval(() => { if (window.turnstile) { if (timer) clearInterval(timer); mount(); } }, 200);

    return () => {
      if (timer) clearInterval(timer);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken, resetKey]);

  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={holder} className="min-h-[65px]" />
    </>
  );
}
