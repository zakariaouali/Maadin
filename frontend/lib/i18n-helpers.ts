/**
 * Small helpers so text that comes from the database (category names) and
 * numbers (prices) follow the language the visitor picked, instead of always
 * showing English.
 */

type Named = {
  name?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  localised_name?: string | null;
};

/** A category's name in the given language, falling back to English. */
export function localizedName(item: Named | null | undefined, locale: string): string {
  if (!item) return "";
  if (item.localised_name) return item.localised_name;
  if (locale === "fr" && item.name_fr) return item.name_fr;
  if (locale === "ar" && item.name_ar) return item.name_ar;
  return item.name ?? "";
}

const NUMBER_LOCALE: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  // Moroccan Arabic keeps Western digits (1,200), as prices are written locally
  ar: "ar-MA",
};

const DATE_LOCALE: Record<string, string> = {
  en: "en-GB", // 26 Sep 2026: day first, like French and Arabic
  fr: "fr-FR",
  ar: "ar-MA",
};

/**
 * Which language to format in. Pass it explicitly wherever the text is also
 * rendered on the server (product cards, the home page): server and browser
 * must agree or React reports a hydration mismatch. When it is left out, the
 * language currently shown on the page is used (browser only), which is right
 * for dashboard screens whose data is loaded after the page opens.
 */
export function resolveLocale(locale?: string): string {
  if (locale) return locale;
  if (typeof document !== "undefined") {
    return document.documentElement.getAttribute("data-locale") ?? document.documentElement.lang ?? "en";
  }
  return "en";
}

/**
 * "1,200" / "1 200": grouped the way the language expects. Always uses an
 * explicit Intl locale, so the server and the browser produce the same text
 * (a bare toLocaleString() differed between them and caused a hydration error).
 */
export function formatAmount(value: number | string, locale?: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat(NUMBER_LOCALE[resolveLocale(locale)] ?? "en-US", {
    maximumFractionDigits: 2,
  }).format(n);
}

/** The currency label: Dirham in Arabic, MAD elsewhere. */
export function currencyLabel(locale?: string): string {
  return resolveLocale(locale) === "ar" ? "درهم" : "MAD";
}

/** "1,200 MAD" as a plain string. */
export function formatPrice(value: number | string, locale?: string): string {
  return `${formatAmount(value, locale)} ${currencyLabel(locale)}`;
}

/** "26 Sep 2026" in the visitor's language. */
export function formatDate(value: string | number | Date, locale?: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALE[resolveLocale(locale)] ?? "en-GB", { dateStyle: "medium" }).format(d);
}

/** "26 Sep 2026, 14:05" in the visitor's language. */
export function formatDateTime(value: string | number | Date, locale?: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALE[resolveLocale(locale)] ?? "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Compact "5m ago" / "il y a 5 min" / "منذ 5 د". */
export function timeAgo(value: string | number | Date, locale?: string): string {
  const l = resolveLocale(locale);
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const h = Math.floor(diff / 3600);
  const d = Math.floor(diff / 86400);

  if (l === "ar") {
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${m} د`;
    if (diff < 86400) return `منذ ${h} س`;
    return `منذ ${d} ي`;
  }
  if (l === "fr") {
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${m} min`;
    if (diff < 86400) return `il y a ${h} h`;
    return `il y a ${d} j`;
  }
  if (diff < 60) return "just now";
  if (diff < 3600) return `${m}m ago`;
  if (diff < 86400) return `${h}h ago`;
  return `${d}d ago`;
}
