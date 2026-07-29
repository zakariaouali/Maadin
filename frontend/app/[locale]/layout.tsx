import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Inter, Cairo } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/Providers";
import "../globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body-latin",
  subsets: ["latin"],
});

const arabic = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Marrakech Maadine - Moroccan Artisan Marketplace",
    fr: "Marrakech Maadine - Marché des artisans marocains",
    ar: "مراكش معادن - سوق الحرفيين المغاربة",
  };
  const descriptions: Record<string, string> = {
    en: "Discover authentic Moroccan artisan products directly from creators in Marrakesh.",
    fr: "Découvrez des produits artisanaux marocains authentiques directement auprès des créateurs à Marrakech.",
    ar: "اكتشف منتجات حرفية مغربية أصيلة مباشرة من الحرفيين في مراكش.",
  };
  const keywords: Record<string, string[]> = {
    en: ["Moroccan artisan marketplace", "Moroccan handmade crafts", "Marrakech artisans", "buy Moroccan crafts online", "handmade Morocco", "Moroccan pottery", "Berber rugs", "Moroccan leather goods"],
    fr: ["marché artisanal marocain", "artisanat marocain fait main", "artisans de Marrakech", "acheter artisanat marocain en ligne", "produits faits main Maroc"],
    ar: ["سوق الحرفيين المغاربة", "منتجات مغربية يدوية", "حرفيو مراكش", "شراء منتجات مغربية"],
  };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = titles[locale] ?? titles.en;
  const description = descriptions[locale] ?? descriptions.en;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: keywords[locale] ?? keywords.en,
    applicationName: "Marrakech Maadine",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr", ar: "/ar" },
    },
    openGraph: {
      type: "website",
      siteName: "Marrakech Maadine",
      title,
      description,
      url: `${siteUrl}/${locale}`,
      images: [{ url: "/logo.png", width: 1991, height: 1163, alt: "Marrakech Maadine" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
    robots: { index: true, follow: true },
    verification: { google: "4vU8Ysy3uFbvG-5_AoCiVBq4DAncuR1y5GA5CKZlTo8" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Marrakech Maadine",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Authentic Moroccan artisan marketplace connecting Marrakesh craftspeople with customers worldwide.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Marrakech Maadine",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: locale,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/${locale}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} ${arabic.variable} h-full antialiased`}
      data-locale={locale}
    >
      <body className="min-h-full flex flex-col bg-sand text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextTopLoader color="#c9a227" height={3} showSpinner={false} />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}