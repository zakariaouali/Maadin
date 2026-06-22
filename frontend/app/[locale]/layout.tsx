import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Inter, Cairo } from "next/font/google";
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
    ar: "مراكش معدن - سوق الحرفيين المغاربة",
  };
  const descriptions: Record<string, string> = {
    en: "Discover authentic Moroccan artisan products directly from creators in Marrakesh.",
    fr: "Découvrez des produits artisanaux marocains authentiques directement auprès des créateurs à Marrakech.",
    ar: "اكتشف منتجات حرفية مغربية أصيلة مباشرة من الحرفيين في مراكش.",
  };

  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    alternates: {
      languages: { en: "/en", fr: "/fr", ar: "/ar" },
    },
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

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} ${arabic.variable} h-full antialiased`}
      data-locale={locale}
    >
      <body className="min-h-full flex flex-col bg-sand text-ink">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}