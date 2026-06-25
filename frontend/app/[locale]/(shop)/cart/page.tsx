"use client";

import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/lib/auth-context";

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  const label = (en: string, fr: string, ar: string) => locale === "fr" ? fr : locale === "ar" ? ar : en;

  const handleCheckout = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    router.push("/checkout");
  };

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="text-6xl">🛒</div>
        <h1 className="font-display text-2xl text-ink">{label("Your cart is empty", "Votre panier est vide", "سلتك فارغة")}</h1>
        <p className="text-stone">{label("Discover our artisan products and add them to your cart.", "Découvrez nos produits artisanaux et ajoutez-les à votre panier.", "اكتشف منتجاتنا الحرفية وأضفها إلى سلتك.")}</p>
        <Link href="/products" className="inline-block mt-2 bg-ink text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gold-deep transition-colors">
          {label("Browse Products", "Parcourir les produits", "تصفح المنتجات")}
        </Link>
      </div>
    );
  }

  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = String(item.seller_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">
          {label("My Cart", "Mon Panier", "سلتي")}
          <span className="text-stone text-lg font-normal ms-2">({items.length})</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-stone hover:text-henna transition-colors">
          {label("Clear cart", "Vider le panier", "إفراغ السلة")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groups).map(([sellerId, groupItems]) => (
            <div key={sellerId} className="bg-white rounded-2xl border border-stone/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone/10 bg-sand/40">
                <p className="text-xs font-semibold text-stone uppercase tracking-wider">{groupItems[0].seller_name}</p>
              </div>
              <div className="divide-y divide-stone/10">
                {groupItems.map(item => {
                  const img = getImageUrl(item.image_path);
                  return (
                    <div key={item.product_id} className="flex items-center gap-4 px-4 py-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand border border-stone/10 shrink-0">
                        {img
                          ? <Image src={img} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center text-stone/30 text-2xl">◈</div>
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-ink hover:text-gold-deep transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-sm font-bold text-gold-deep mt-0.5">{(item.price * item.quantity).toLocaleString()} MAD</p>
                        <p className="text-xs text-stone">{item.price.toLocaleString()} MAD {label("each", "chacun", "للواحدة")}</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center border border-stone/20 rounded-lg overflow-hidden shrink-0">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-stone hover:bg-sand hover:text-ink transition-colors text-lg leading-none">−</button>
                        <span className="w-8 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, Math.min(item.quantity + 1, item.stock_quantity))}
                          className="w-8 h-8 flex items-center justify-center text-stone hover:bg-sand hover:text-ink transition-colors text-lg leading-none">+</button>
                      </div>

                      <button onClick={() => removeItem(item.product_id)} className="text-stone hover:text-henna transition-colors p-1 shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-stone/10 p-5 space-y-4 sticky top-24">
            <h2 className="font-semibold text-ink">{label("Order Summary", "Récapitulatif", "ملخص الطلب")}</h2>

            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.product_id} className="flex justify-between text-stone">
                  <span className="truncate me-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0 font-medium">{(item.price * item.quantity).toLocaleString()} MAD</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone/10 pt-3 flex justify-between font-bold text-ink text-base">
              <span>{label("Total", "Total", "المجموع")}</span>
              <span>{totalPrice().toLocaleString()} MAD</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-800 flex gap-2">
              <span>💵</span>
              <span>{label("Payment on delivery — cash only.", "Paiement à la livraison — espèces uniquement.", "الدفع عند الاستلام — نقداً فقط.")}</span>
            </div>

            <button onClick={handleCheckout}
              className="w-full py-3 bg-ink hover:bg-gold-deep text-white rounded-xl font-semibold text-sm transition-colors">
              {label("Proceed to Checkout →", "Passer la commande →", "متابعة الطلب →")}
            </button>

            <Link href="/products" className="block text-center text-sm text-stone hover:text-gold-deep transition-colors">
              {label("← Continue shopping", "← Continuer mes achats", "← متابعة التسوق")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
