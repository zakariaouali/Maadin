import { ReactNode } from "react";

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
  const map: Record<string, { label: string; variant: Variant }> = {
    pending:   { label: "Pending",   variant: "warning" },
    confirmed: { label: "Confirmed", variant: "info" },
    shipped:   { label: "Shipped",   variant: "gold" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "danger" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function SellerLevelBadge({ level }: { level: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    bronze:           { label: "Bronze",           variant: "default" },
    silver:           { label: "Silver",           variant: "info" },
    gold:             { label: "Gold",             variant: "gold" },
    verified_artisan: { label: "Verified Artisan", variant: "success" },
  };
  const cfg = map[level] ?? { label: level, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function SellerStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    pending:   { label: "Pending",   variant: "warning" },
    verified:  { label: "Verified",  variant: "success" },
    suspended: { label: "Suspended", variant: "danger" },
  };
  const cfg = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
