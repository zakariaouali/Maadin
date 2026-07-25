import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PlansClient from "./PlansClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plans");
  return { title: t("metaTitle") };
}

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });

  const plans = [
    {
      key: "starter",
      name: t("starterName"),
      price: t("starterPrice"),
      desc: t("starterDesc"),
      features: [t("starterF1"), t("starterF2"), t("starterF3"), t("starterF4"), t("starterF5")],
      cta: t("getStarted"),
      popular: false,
      highlight: false,
      free: true,
    },
    {
      key: "managed",
      name: t("managedName"),
      price: t("managedPrice"),
      desc: t("managedDesc"),
      features: [t("managedF1"), t("managedF2"), t("managedF3"), t("managedF4"), t("managedF5")],
      cta: t("contactUs"),
      popular: true,
      highlight: true,
      free: false,
    },
    {
      key: "premium",
      name: t("premiumName"),
      price: t("premiumPrice"),
      desc: t("premiumDesc"),
      features: [t("premiumF1"), t("premiumF2"), t("premiumF3"), t("premiumF4"), t("premiumF5")],
      cta: t("contactUs"),
      popular: false,
      highlight: false,
      free: false,
    },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ];

  const i18n = {
    sellWithUs: t("sellWithUs"),
    headline: t("headline"),
    sub: t("sub"),
    mostPopular: t("mostPopular"),
    faq: t("faq"),
    currentPlan: t("currentPlan"),
    upgradeNow: t("upgradeNow"),
    registerWithPlan: t("registerWithPlan"),
    weWillContact: t("weWillContact"),
  };

  return <PlansClient plans={plans} faqs={faqs} i18n={i18n} />;
}
