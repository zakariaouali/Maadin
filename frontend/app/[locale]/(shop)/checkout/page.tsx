"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";
import { useCartSync } from "@/lib/useCartSync";
import { CartSyncNotice } from "@/components/shop/CartSyncNotice";
import api from "@/lib/api";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { Button, Input, Alert, PageHeader } from "@/components/ui";
import { formatPrice } from "@/lib/i18n-helpers";

interface SavedAddress { id: number; label: string | null; address: string; city: string; phone: string; is_default: boolean }

export default function CheckoutPage() {
  const tu = useTranslations("ui");
  const t = useTranslations("checkout");
  const locale = useLocale();
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { items, totalPrice, clearCart } = useCartStore();
  const { changes, dismiss } = useCartSync();

  const idempotencyKey = useMemo(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    []
  );

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<number | "new">("new");
  const [saveThis, setSaveThis] = useState(true);

  // Saved addresses: preselect the default one. If they cannot be loaded, the form still works.
  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    api.get("/customer/addresses")
      .then(({ data }: { data: SavedAddress[] }) => {
        if (!alive || data.length === 0) return;
        const pick = data.find((a) => a.is_default) ?? data[0];
        setSaved(data);
        setSelectedId(pick.id);
        setAddress(pick.address); setCity(pick.city); setPhone(pick.phone);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [isAuthenticated]);

  const chooseSaved = (a: SavedAddress) => {
    setSelectedId(a.id);
    setAddress(a.address); setCity(a.city); setPhone(a.phone);
  };
  const chooseNew = () => {
    setSelectedId("new");
    setAddress(""); setCity(""); setPhone(user?.phone ?? "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-2 border-stone/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-stone mb-6">{t("loginRequired")}</p>
        <Link href="/login">
          <Button variant="primary">{t("goToLogin")}</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-stone mb-6">{tCart("empty")}</p>
        <Link href="/products">
          <Button variant="primary">{tCart("browseProducts")}</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/customer/checkout", {
        idempotency_key: idempotencyKey,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: address,
        shipping_city: city,
        shipping_phone: phone,
        notes,
      });

      // Keep a new address for next time (never blocks or fails the order)
      const alreadySaved = saved.some((a) => a.address === address && a.city === city && a.phone === phone);
      if (saveThis && selectedId === "new" && !alreadySaved) {
        await api.post("/customer/addresses", { address, city, phone }).catch(() => {});
      }

      clearCart();
      const firstOrder = Array.isArray(data) ? data[0] : data;
      const orderNum = firstOrder?.order_number ?? "";
      router.push(`/checkout/success${orderNum ? `?order=${orderNum}` : ""}`);
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.items?.[0] ||
          err.response?.data?.message ||
          t("failed")
      );
    }

    setSubmitting(false);
  };

  // Group by seller for summary display
  const bySeller = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.seller_name || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10">
      <CartSyncNotice changes={changes} onDismiss={dismiss} />
      <PageHeader title={t("title")} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Shipping form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-stone/20 rounded-sm p-6">
            <h2 className="font-display text-lg text-ink mb-5">{t("shippingInfo")}</h2>

            <div className="flex flex-col gap-4">
              {saved.length > 0 && (
                <div className="flex flex-col gap-2" role="radiogroup" aria-label={t("savedAddresses")}>
                  {saved.map((a) => (
                    <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 text-sm ${selectedId === a.id ? "border-gold-deep bg-gold/5" : "border-stone/20"}`}>
                      <input type="radio" name="addr" checked={selectedId === a.id} onChange={() => chooseSaved(a)} className="mt-1 accent-gold-deep" />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">{a.label || t("address")}</span>
                        <span className="block text-stone" dir="auto">{a.address}, {a.city}</span>
                        <span className="block text-stone" dir="ltr">{a.phone}</span>
                      </span>
                    </label>
                  ))}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-sm border p-3 text-sm ${selectedId === "new" ? "border-gold-deep bg-gold/5" : "border-stone/20"}`}>
                    <input type="radio" name="addr" checked={selectedId === "new"} onChange={chooseNew} className="accent-gold-deep" />
                    <span className="text-ink">{t("useNewAddress")}</span>
                  </label>
                  <Link href="/customer/addresses" className="text-xs text-gold-deep hover:underline w-fit">{t("manageAddresses")}</Link>
                </div>
              )}

              {selectedId === "new" && (
                <>
                <Input
                  label={t("address")}
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="123 Rue Mohammed V"
                />
                <Input
                  label={t("city")}
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Marrakech"
                />
                <Input
                  label={t("phone")}
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="06XXXXXXXX"
                />

                  <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                    <input type="checkbox" checked={saveThis} onChange={(e) => setSaveThis(e.target.checked)} className="accent-gold-deep" />
                    {t("saveThisAddress")}
                  </label>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="notes" className="text-sm text-stone">{t("notes")}</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={tu("deliveryNotesPlaceholder")}
                  className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-stone/20 rounded-sm p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <p className="text-sm text-ink">{t("paymentMethod")}</p>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            {t("placeOrder")}
          </Button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-stone/20 rounded-sm p-6 sticky top-24">
            <h2 className="font-display text-lg text-ink mb-5">{t("orderSummary")}</h2>

            <div className="flex flex-col gap-5">
              {Object.entries(bySeller).map(([sellerName, sellerItems]) => (
                <div key={sellerName}>
                  <p className="text-xs text-stone uppercase tracking-wide mb-3">{sellerName}</p>
                  <div className="flex flex-col gap-2">
                    {sellerItems.map((item) => {
                      const img = getImageUrl(item.image_path ?? undefined);
                      return (
                        <div key={item.product_id} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-sand border border-stone/10 shrink-0 flex items-center justify-center">
                            {img
                              ? <Image src={img} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone/30"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            }
                          </div>
                          <span className="text-stone line-clamp-1 flex-1 me-2">
                            {item.name} <span className="text-stone/60">×{item.quantity}</span>
                          </span>
                          <span className="text-ink shrink-0 font-medium">
                            {formatPrice(item.price * item.quantity, locale)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="zellige-divider my-4" />

            <div className="flex justify-between font-semibold text-ink text-base">
              <span>{tu("total")}</span>
              <span>{formatPrice(totalPrice(), locale)}</span>
            </div>

            <p className="text-xs text-stone mt-3 leading-relaxed">
              {tu("checkoutTermsNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
