"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { Button, Input, Alert, PageHeader } from "@/components/ui";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { items, totalPrice, clearCart } = useCartStore();

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
        <p className="text-stone mb-6">Your cart is empty.</p>
        <Link href="/products">
          <Button variant="primary">Browse products</Button>
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

      clearCart();
      router.push(`/customer/orders?confirmed=${data.length}`);
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.items?.[0] ||
          err.response?.data?.message ||
          "Checkout failed. Please try again."
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader title={t("title")} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Shipping form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-stone/20 rounded-sm p-6">
            <h2 className="font-display text-lg text-ink mb-5">{t("shippingInfo")}</h2>

            <div className="flex flex-col gap-4">
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

              <div className="flex flex-col gap-1">
                <label htmlFor="notes" className="text-sm text-stone">{t("notes")}</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any delivery instructions..."
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
                    {sellerItems.map((item) => (
                      <div key={item.product_id} className="flex justify-between text-sm">
                        <span className="text-stone line-clamp-1 flex-1 me-2">
                          {item.name} <span className="text-stone/60">×{item.quantity}</span>
                        </span>
                        <span className="text-ink shrink-0 font-medium">
                          {(item.price * item.quantity).toFixed(2)} MAD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="zellige-divider my-4" />

            <div className="flex justify-between font-semibold text-ink text-base">
              <span>Total</span>
              <span>{totalPrice().toFixed(2)} MAD</span>
            </div>

            <p className="text-xs text-stone mt-3 leading-relaxed">
              By placing your order you agree to our terms. Payment is collected on delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
