"use client";

import { useTranslations } from "next-intl";

/** Every action name the backend writes to the audit log. Add new ones here and in messages/*.json (auditActions). */
export const AUDIT_ACTIONS = [
  "update_user_status", "verify_seller", "suspend_seller", "reactivate_seller",
  "approve_product", "reject_product", "remove_product", "toggle_product_active",
  "approve_review", "reject_review", "remove_review", "issue_penalty",
  "create_category", "update_category", "delete_category", "update_support_ticket",
  "update_subscription", "mark_subscription_paid", "approve_plan_upgrade", "reject_plan_upgrade",
  "create_managed_store", "update_managed_store", "create_managed_product",
  "order_status_changed", "order_put_on_hold", "order_hold_released", "order_message_sent",
  "conversation_reply_sent", "remove_conversation",
] as const;

export const AUDIT_SUBJECTS = ["user", "seller", "product", "review", "category", "order", "conversation", "support_ticket"] as const;

const CHANGE_KEYS: readonly string[] = ["status", "from", "to", "tracking_number", "reason", "excerpt", "is_active", "name", "store_name", "penalty_type", "duration_days", "to_plan", "new_expiry", "fields", "product_id", "replied", "priority", "subscription_expires_at", "monthly_fee"];
const CHANGE_VALUES: readonly string[] = ["pending", "confirmed", "shipped", "delivered", "cancelled", "active", "suspended", "banned", "verified", "warning", "suspension", "ban", "managed", "premium", "fake_stock", "delayed_order", "bad_behavior", "other", "open", "in_progress", "resolved", "closed", "low", "normal", "high", "true", "false"];

/** Translated labels for audit entries: the action, the kind of record, and a readable "what changed" line. */
export function useAuditLabels() {
  const t = useTranslations("auditActions");
  const key = (k: string) => (CHANGE_KEYS.includes(k) ? t(`key_${k}`) : k.replace(/_/g, " "));
  const value = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return CHANGE_VALUES.includes(s) ? t(`val_${s}`) : s;
  };

  return {
    action: (a: string) => ((AUDIT_ACTIONS as readonly string[]).includes(a) ? t(a) : a.replace(/_/g, " ")),
    subject: (s: string) => ((AUDIT_SUBJECTS as readonly string[]).includes(s) ? t(`subject_${s}`) : s.replace(/_/g, " ")),
    /** e.g. "Status: Pending, Tracking number: TRK-1" in the reader's language */
    changes: (changes: Record<string, unknown> | null | undefined): string => {
      if (!changes) return "";
      return Object.entries(changes)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${key(k)}: ${v.map((x) => key(String(x))).join(", ")}`;
          if (typeof v === "object") return `${key(k)}: ${JSON.stringify(v)}`;
          return `${key(k)}: ${value(v)}`;
        })
        .join(" · ");
    },
  };
}
