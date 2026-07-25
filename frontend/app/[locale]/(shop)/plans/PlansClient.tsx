"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Button, Alert } from "@/components/ui";

interface Plan {
  key: string;
  name: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  popular: boolean;
  highlight: boolean;
  free: boolean;
}

interface Faq {
  q: string;
  a: string;
}

interface I18n {
  sellWithUs: string;
  headline: string;
  sub: string;
  mostPopular: string;
  faq: string;
  currentPlan: string;
  upgradeNow: string;
  registerWithPlan: string;
  weWillContact: string;
}

export default function PlansClient({
  plans,
  faqs,
  i18n,
}: {
  plans: Plan[];
  faqs: Faq[];
  i18n: I18n;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isSeller = user?.role === "seller";
  const currentPlan = user?.plan ?? null;

  const PLAN_ORDER = ["starter", "managed", "premium"];
  const canUpgrade = (planKey: string) => {
    if (!isSeller || !currentPlan) return false;
    return PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(currentPlan);
  };

  const handlePlanClick = async (planKey: string) => {
    if (!isAuthenticated || !isSeller) {
      router.push(`/register?role=seller&plan=${planKey}`);
      return;
    }

    if (planKey === currentPlan) return;

    if (!canUpgrade(planKey)) return;

    setLoading(planKey);
    setError("");
    setSuccess("");
    try {
      await api.post("/seller/subscription/upgrade", { to_plan: planKey });
      setSuccess(i18n.weWillContact);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Something went wrong.");
    }
    setLoading(null);
  };

  const getCtaLabel = (plan: Plan) => {
    if (isSeller) {
      if (plan.key === currentPlan) return i18n.currentPlan;
      if (canUpgrade(plan.key)) return i18n.upgradeNow;
      return plan.cta;
    }
    return i18n.registerWithPlan;
  };

  const isDisabled = (plan: Plan) => {
    if (isSeller && plan.key === currentPlan) return true;
    if (isSeller && !canUpgrade(plan.key)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-white border-b border-stone/15">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold tracking-widest text-[#c9a227] uppercase mb-3">
            {i18n.sellWithUs}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-3">{i18n.headline}</h1>
          <p className="text-stone max-w-xl mx-auto">{i18n.sub}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {success && (
          <Alert type="success" className="max-w-xl mx-auto">
            {success}
          </Alert>
        )}
        {error && (
          <Alert type="error" className="max-w-xl mx-auto">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const active = isSeller && plan.key === currentPlan;
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-sm border flex flex-col ${
                  active
                    ? "border-green-500 shadow-md"
                    : plan.highlight
                    ? "border-[#c9a227] shadow-lg"
                    : "border-stone/20"
                }`}
              >
                {plan.popular && !active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a227] text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    {i18n.mostPopular}
                  </div>
                )}
                {active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                    {i18n.currentPlan}
                  </div>
                )}

                <div className="p-6 flex-1">
                  <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
                  <p className="text-2xl font-extrabold text-ink mt-1 mb-1">{plan.price}</p>
                  <p className="text-sm text-stone mb-5">{plan.desc}</p>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    variant={plan.highlight && !active ? "primary" : "secondary"}
                    className="w-full"
                    loading={loading === plan.key}
                    disabled={isDisabled(plan)}
                    onClick={() => handlePlanClick(plan.key)}
                  >
                    {getCtaLabel(plan)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-ink mb-6 text-center">{i18n.faq}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-stone/20 rounded-sm p-5">
                <p className="font-semibold text-ink mb-1">{faq.q}</p>
                <p className="text-sm text-stone">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
