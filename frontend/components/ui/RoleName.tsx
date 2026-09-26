import { useTranslations } from "next-intl";

/** "customer" / "seller" / "admin" shown in the visitor's language (the stored value is English). */
export function RoleName({ role }: { role?: string | null }) {
  const tAuth = useTranslations("auth");
  const tu = useTranslations("ui");
  if (role === "customer") return <>{tAuth("roleCustomer")}</>;
  if (role === "seller") return <>{tAuth("roleSeller")}</>;
  if (role === "admin") return <>{tu("roleAdmin")}</>;
  if (role === "guest") return <>{tu("roleGuest")}</>;
  return <>{role ?? ""}</>;
}

/** "starter" / "managed" / "premium" in the visitor's language. */
export function PlanName({ plan }: { plan?: string | null }) {
  const tp = useTranslations("plans");
  if (plan === "starter") return <>{tp("starterName")}</>;
  if (plan === "managed") return <>{tp("managedName")}</>;
  if (plan === "premium") return <>{tp("premiumName")}</>;
  return <>{plan ?? ""}</>;
}
