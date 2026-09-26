export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Next.js replaces (does not merge) a parent's openGraph when a page defines
 * its own, so every page that sets openGraph must repeat the image or social
 * shares (WhatsApp, Facebook) lose their preview picture.
 */
export const DEFAULT_OG_IMAGES = [
  { url: "/logo.png", width: 1991, height: 1163, alt: "Marrakech Maadine" },
];

/** Canonical URL plus the same page in every language, for one path ("" = home). */
export function pageAlternates(locale: string, path = "") {
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: {
      en: `${SITE_URL}/en${path}`,
      fr: `${SITE_URL}/fr${path}`,
      ar: `${SITE_URL}/ar${path}`,
    },
  };
}
