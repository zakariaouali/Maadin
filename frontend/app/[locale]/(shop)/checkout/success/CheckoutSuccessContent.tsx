"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CheckoutSuccessContent() {
  const t = useTranslations("checkout");
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl text-ink">{t("successTitle")}</h1>
          <p className="text-stone leading-relaxed">{t("successDesc")}</p>
          {orderNumber && (
            <p className="text-sm text-stone/70 font-mono mt-1">
              {t("orderNumber")} #{orderNumber}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/customer/orders"
            className="inline-flex items-center justify-center bg-gold hover:bg-gold-deep text-ink font-medium px-6 py-2.5 rounded-sm transition-colors text-sm"
          >
            {t("viewMyOrders")}
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center border border-stone/30 text-stone hover:border-gold hover:text-ink px-6 py-2.5 rounded-sm transition-colors text-sm"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
