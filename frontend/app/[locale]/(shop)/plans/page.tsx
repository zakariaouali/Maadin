import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plans");
  return { title: t("metaTitle") };
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default async function PlansPage() {
  const t = await getTranslations("plans");

  const plans = [
    {
      key: "starter",
      name: t("starterName"),
      price: t("starterPrice"),
      desc: t("starterDesc"),
      features: [t("starterF1"), t("starterF2"), t("starterF3"), t("starterF4"), t("starterF5")],
      cta: t("getStarted"),
      href: "/register?role=seller&plan=starter",
      popular: false,
      highlight: false,
    },
    {
      key: "managed",
      name: t("managedName"),
      price: t("managedPrice"),
      desc: t("managedDesc"),
      features: [t("managedF1"), t("managedF2"), t("managedF3"), t("managedF4"), t("managedF5")],
      cta: t("contactUs"),
      href: "/register?role=seller&plan=managed",
      popular: true,
      highlight: true,
    },
    {
      key: "premium",
      name: t("premiumName"),
      price: t("premiumPrice"),
      desc: t("premiumDesc"),
      features: [t("premiumF1"), t("premiumF2"), t("premiumF3"), t("premiumF4"), t("premiumF5")],
      cta: t("contactUs"),
      href: "/register?role=seller&plan=premium",
      popular: false,
      highlight: false,
    },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ];

  return (
    <main className="min-h-screen bg-[#f7f3ea]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1f1b16] py-24 px-6 text-center">
        {/* Zellige pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9a227' fill-rule='evenodd'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-4 font-medium"
            style={{ textShadow: "0 0 20px rgba(201,162,39,0.6)" }}>
            {t("sellWithUs")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            {t("headline")}
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">{t("sub")}</p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border overflow-hidden transition-shadow duration-300 ${
                plan.highlight
                  ? "border-[#c9a227] shadow-[0_0_40px_rgba(201,162,39,0.18)] bg-[#1f1b16]"
                  : "border-[#e0d9ce] bg-white hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="bg-[#c9a227] text-[#1f1b16] text-[10px] font-bold uppercase tracking-widest text-center py-1.5 px-4">
                  {t("mostPopular")}
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Plan name & price */}
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-[#1f1b16]"}`}>
                    {plan.name}
                  </h2>
                  <div className={`text-2xl font-extrabold mb-3 ${plan.highlight ? "text-[#c9a227]" : "text-[#1f1b16]"}`}>
                    {plan.price}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-white/60" : "text-[#8b8378]"}`}>
                    {plan.desc}
                  </p>
                </div>

                {/* Divider */}
                <div className={`w-full h-px mb-6 ${plan.highlight ? "bg-white/10" : "bg-[#e0d9ce]"}`} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className={`text-sm ${plan.highlight ? "text-white/80" : "text-[#1f1b16]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-[#c9a227] text-[#1f1b16] hover:bg-[#d4aa2e] shadow-[0_0_20px_rgba(201,162,39,0.4)]"
                      : "border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#1f1b16]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-[#1f1b16] text-center mb-10">{t("faq")}</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e0d9ce] p-6">
              <h3 className="font-semibold text-[#1f1b16] mb-2">{faq.q}</h3>
              <p className="text-sm text-[#8b8378] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
