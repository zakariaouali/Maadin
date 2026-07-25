import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import SupportForm from "./SupportForm";
import { CategoryIcon } from "@/components/support/CategoryIcon";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });

  const title = t("metaTitle");
  const description = t("metaDescription");
  const url = `${SITE_URL}/${locale}/support`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/support`,
        fr: `${SITE_URL}/fr/support`,
        ar: `${SITE_URL}/ar/support`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

const FAQS: { q: string; a: string }[] = [];

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });

  const categories = [
    { key: "order",     label: t("catOrder"),     desc: t("catOrderDesc") },
    { key: "account",   label: t("catAccount"),   desc: t("catAccountDesc") },
    { key: "billing",   label: t("catBilling"),   desc: t("catBillingDesc") },
    { key: "technical", label: t("catTechnical"), desc: t("catTechnicalDesc") },
    { key: "report",    label: t("catReport"),    desc: t("catReportDesc") },
    { key: "other",     label: t("catOther"),     desc: t("catOtherDesc") },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
    { q: t("faq5q"), a: t("faq5a") },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ── Hero ── */}
      <section className="relative bg-[#1f1b16] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #c9a96e 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8b6914 0%, transparent 50%)" }} />
        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-gold-light text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {t("supportBadge")}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* ── Categories + Form ── */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <SupportForm categories={categories} t={{
          formTitle: t("formTitle"),
          selectCategory: t("selectCategory"),
          nameLabel: t("nameLabel"),
          emailLabel: t("emailLabel"),
          subjectLabel: t("subjectLabel"),
          messageLabel: t("messageLabel"),
          messagePlaceholder: t("messagePlaceholder"),
          submitBtn: t("submitBtn"),
          submitting: t("submitting"),
          successTitle: t("successTitle"),
          successDesc: t("successDesc"),
          newTicket: t("newTicket"),
          viewTickets: t("viewTickets"),
          errorFallback: t("errorFallback"),
          namePlaceholder: t("namePlaceholder"),
          emailPlaceholder: t("emailPlaceholder"),
          subjectPlaceholder: t("subjectPlaceholder"),
          required: t("required"),
        }} />
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="font-display text-2xl text-[#1f1b16] mb-8 text-center">{t("faqTitle")}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white rounded-2xl border border-stone/10 overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none list-none font-medium text-[#1f1b16]">
                {faq.q}
                <svg className="w-4 h-4 text-stone shrink-0 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm text-stone leading-relaxed border-t border-stone/10 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
