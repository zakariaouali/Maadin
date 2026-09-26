"use client";

import { useTranslations } from "next-intl";
import type { CartChange } from "@/store/cartStore";

/** Tells the customer what changed when their saved cart was refreshed against the live catalogue. */
export function CartSyncNotice({ changes, onDismiss }: { changes: CartChange[]; onDismiss: () => void }) {
  const t = useTranslations("cart");
  if (changes.length === 0) return null;

  return (
    <div role="status" className="mb-6 rounded-xl border border-[#c9a227]/40 bg-[#c9a227]/10 px-5 py-4">
      <p className="text-sm font-semibold text-ink mb-1.5">{t("syncTitle")}</p>
      <ul className="text-sm text-[#7a5f10] space-y-1 list-disc ps-5">
        {changes.map((c, i) => (
          <li key={i}>
            {c.type === "removed" && t("syncRemoved", { name: c.name })}
            {c.type === "price" && t("syncPrice", { name: c.name, price: c.price })}
            {c.type === "stock" && t("syncStock", { name: c.name, count: c.count })}
          </li>
        ))}
      </ul>
      <button onClick={onDismiss} className="mt-3 text-xs font-medium text-ink underline underline-offset-2">
        {t("syncDismiss")}
      </button>
    </div>
  );
}
