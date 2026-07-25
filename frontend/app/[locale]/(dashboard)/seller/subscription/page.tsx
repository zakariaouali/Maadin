"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import { Alert, Button, PageHeader, Spinner } from "@/components/ui";

interface SubscriptionStatus {
  plan: string;
  subscription_expires_at: string | null;
  monthly_fee: string | null;
  days_left: number | null;
  store_status: string | null;
  pending_upgrade: { id: number; from_plan: string; to_plan: string; status: string } | null;
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  managed: "Managed — 100 MAD/mo",
  premium: "Premium",
};

const PLAN_ORDER = ["starter", "managed", "premium"];

export default function SellerSubscriptionPage() {
  const t = useTranslations("seller");
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/subscription");
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const requestUpgrade = async (toPlan: string) => {
    setUpgrading(toPlan);
    setError("");
    setSuccess("");
    try {
      await api.post("/seller/subscription/upgrade", { to_plan: toPlan });
      setSuccess(t("upgradeSent"));
      load();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Something went wrong.");
    }
    setUpgrading(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return <Alert type="error">{t("failedLoad")}</Alert>;
  }

  const isSuspended = data.store_status === "suspended_subscription";
  const isUpgradePending = data.store_status === "upgrade_pending";
  const daysLeft = data.days_left !== null ? Math.round(data.days_left) : null;
  const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const expired = daysLeft !== null && daysLeft < 0;

  const upgradePlans = PLAN_ORDER.filter(
    (p) => PLAN_ORDER.indexOf(p) > PLAN_ORDER.indexOf(data.plan)
  );

  const daysOverdueText = daysLeft !== null && expired
    ? Math.abs(daysLeft) === 1
      ? t("daysOverdue", { days: Math.abs(daysLeft) })
      : t("daysOverduePlural", { days: Math.abs(daysLeft) })
    : "";

  const daysRemainingText = daysLeft !== null && !expired
    ? daysLeft === 1
      ? t("daysRemaining", { days: daysLeft })
      : t("daysRemainingPlural", { days: daysLeft })
    : "";

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title={t("subscription")} />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {isSuspended && <Alert type="error">{t("suspendedAlert")}</Alert>}
      {isUpgradePending && <Alert type="warning">{t("upgradePendingAlert")}</Alert>}
      {!isSuspended && !isUpgradePending && expired && <Alert type="error">{t("expiredAlert")}</Alert>}
      {!isSuspended && !isUpgradePending && expiringSoon && !expired && (
        <Alert type="warning">
          {daysLeft === 1
            ? t("expiringSoonAlert", { days: daysLeft })
            : t("expiringSoonAlertPlural", { days: daysLeft })}
        </Alert>
      )}

      {/* Current plan card */}
      <div className="bg-white border border-stone/20 rounded-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone uppercase tracking-wide">{t("currentPlan")}</h2>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-ink capitalize">{data.plan}</span>
          {data.plan !== "starter" && (
            <span className="text-xs bg-[#c9a227]/15 text-[#9c7a1a] font-semibold px-2.5 py-0.5 rounded-full">
              {data.monthly_fee ? `${parseFloat(data.monthly_fee).toFixed(0)} MAD/mo` : "Paid"}
            </span>
          )}
        </div>

        {data.subscription_expires_at && (
          <div className="text-sm text-stone space-y-1">
            <div>
              {t("nextDue")}:{" "}
              <strong className={expired ? "text-red-600" : expiringSoon ? "text-amber-600" : "text-ink"}>
                {new Date(data.subscription_expires_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
            {daysLeft !== null && (
              <div className={expired ? "text-red-600 font-medium" : expiringSoon ? "text-amber-600" : "text-stone/70"}>
                {expired ? daysOverdueText : daysRemainingText}
              </div>
            )}
          </div>
        )}

        {data.plan === "starter" && (
          <p className="text-sm text-stone">{t("freePlan")}</p>
        )}
      </div>

      {/* Pending upgrade request */}
      {data.pending_upgrade && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-5">
          <p className="text-sm font-medium text-amber-800">
            {t("upgradePending", {
              from: data.pending_upgrade.from_plan,
              to: data.pending_upgrade.to_plan,
            })}
          </p>
          <p className="text-xs text-amber-700 mt-1">{t("upgradePendingDesc")}</p>
        </div>
      )}

      {/* Upgrade options */}
      {!data.pending_upgrade && upgradePlans.length > 0 && !isSuspended && (
        <div className="bg-white border border-stone/20 rounded-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone uppercase tracking-wide">{t("upgradeTitle")}</h2>
          <div className="space-y-3">
            {upgradePlans.map((plan) => (
              <div
                key={plan}
                className="flex items-center justify-between gap-4 p-4 border border-stone/15 rounded-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-ink capitalize">{plan}</p>
                  <p className="text-xs text-stone">{PLAN_LABELS[plan]}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={upgrading === plan}
                  onClick={() => requestUpgrade(plan)}
                >
                  {t("requestUpgrade")}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone/70">{t("upgradeHint")}</p>
        </div>
      )}

      <div className="text-center">
        <Link href="/plans" className="text-sm text-[#c9a227] hover:underline">
          {t("viewAllPlans")}
        </Link>
      </div>
    </div>
  );
}
