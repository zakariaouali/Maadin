"use client";

import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/i18n-helpers";

export interface TimelineOrder {
  status: string;
  on_hold?: boolean;
  tracking_number?: string | null;
  created_at: string;
  updated_at?: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}

type Step = { key: string; label: string; at?: string | null; tracking?: string; state: "done" | "current" | "upcoming" | "cancelled" };

/** Where the order is, step by step, with the date each step happened and the tracking number. */
export function OrderTimeline({ order }: { order: TimelineOrder }) {
  const t = useTranslations("orders");

  const flow = ["pending", "confirmed", "shipped", "delivered"];
  const reached = flow.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  const steps: Step[] = [];
  if (cancelled) {
    // Show only the steps that really happened, then the cancellation
    steps.push({ key: "pending", label: t("stepPlaced"), at: order.created_at, state: "done" });
    if (order.confirmed_at) steps.push({ key: "confirmed", label: t("stepConfirmed"), at: order.confirmed_at, state: "done" });
    if (order.shipped_at) steps.push({ key: "shipped", label: t("stepShipped"), at: order.shipped_at, state: "done" });
    steps.push({ key: "cancelled", label: t("stepCancelled"), at: order.cancelled_at ?? order.updated_at, state: "cancelled" });
  } else {
    const labels = [t("stepPlaced"), t("stepConfirmed"), t("stepShipped"), t("stepDelivered")];
    const dates = [order.created_at, order.confirmed_at, order.shipped_at, order.delivered_at];
    flow.forEach((key, i) => {
      steps.push({
        key,
        label: labels[i],
        at: dates[i],
        tracking: key === "shipped" && order.tracking_number ? order.tracking_number : undefined,
        // a delivered order is finished: no step is "current" any more
        state: i < reached || (i === reached && order.status === "delivered") ? "done" : i === reached ? "current" : "upcoming",
      });
    });
  }

  const dot = {
    done: "bg-gold border-gold text-ink",
    current: "bg-white border-gold text-gold-deep ring-4 ring-gold/20",
    upcoming: "bg-white border-stone/30 text-stone/40",
    cancelled: "bg-henna border-henna text-white",
  };

  return (
    <div className="bg-white border border-stone/20 rounded-sm p-5">
      <h2 className="text-sm font-semibold text-ink mb-4">{t("timelineTitle")}</h2>
      <ol>
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
              {!last && <span aria-hidden="true" className={`absolute start-[11px] top-6 bottom-0 w-px ${s.state === "done" ? "bg-gold" : "bg-stone/20"}`} />}
              <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${dot[s.state]}`}>
                {s.state === "done" ? "✓" : s.state === "cancelled" ? "✕" : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm ${s.state === "upcoming" ? "text-stone/60" : "font-medium text-ink"}`}>{s.label}</p>
                {s.at && s.state !== "upcoming" && <p className="text-xs text-stone">{formatDate(s.at)}</p>}
                {s.tracking && (
                  <p className="text-xs text-stone mt-0.5">
                    {t("trackingNumber")}: <span dir="ltr" className="inline-block font-mono text-ink">{s.tracking}</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {order.on_hold && !cancelled && order.status !== "delivered" && (
        <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">{t("onHoldNote")}</p>
      )}
    </div>
  );
}
