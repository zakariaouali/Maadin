import { ReactNode } from "react";
import { useTranslations } from "next-intl";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  default: "bg-stone/10 text-stone",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-henna",
  info: "bg-blue-100 text-blue-800",
  gold: "bg-gold/20 text-gold-deep",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Convenience helpers for order statuses
export function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslations("seller");
  const map: Record<string, { label: string; variant: Variant }> = {
    pending:   { label: t("statusPending"),   variant: "warning" },
    confirmed: { label: t("statusConfirmed"), variant: "info" },
    shipped:   { label: t("statusShipped"),   variant: "gold" },
    delivered: { label: t("statusDelivered"), variant: "success" },
    cancelled: { label: t("statusCancelled"), variant: "danger" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function SellerLevelBadge({ level }: { level: string }) {
  const t = useTranslations("ui");
  const map: Record<string, { label: string; variant: Variant }> = {
    bronze:           { label: t("levelBronze"),     variant: "default" },
    silver:           { label: t("levelSilver"),     variant: "info" },
    gold:             { label: t("levelGold"),       variant: "gold" },
    verified_artisan: { label: t("verifiedArtisan"), variant: "success" },
  };
  const cfg = map[level] ?? { label: level, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function SellerStatusBadge({ status }: { status: string }) {
  const t = useTranslations("ui");
  const map: Record<string, { label: string; variant: Variant }> = {
    pending:   { label: t("statusPending"),   variant: "warning" },
    verified:  { label: t("statusVerified"),  variant: "success" },
    suspended: { label: t("statusSuspended"), variant: "danger" },
    upgrade_pending:        { label: t("statusUpgradePending"),        variant: "warning" },
    suspended_subscription: { label: t("statusSuspendedSubscription"), variant: "danger" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
