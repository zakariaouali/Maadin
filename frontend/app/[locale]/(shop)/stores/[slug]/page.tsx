import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import { ProductCard } from "@/components/ui";
import ContactSellerButton from "./ContactSellerButton";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function fetchStore(slug: string, locale: string) {
  const res = await fetch(`${API}/stores/${slug}?locale=${locale}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch store");
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const data = await fetchStore(slug, locale);
  if (!data) return {};
  const { store } = data;
  return {
    title: `${store.store_name} – Marrakech Maadine`,
    description: store.store_description ?? `Browse handmade products by ${store.store_name}.`,
    openGraph: {
      title: store.store_name,
      images: store.banner_path ? [getImageUrl(store.banner_path)] : [],
    },
  };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < full ? "#c9a227" : i === full && half ? "url(#half)" : "none"} stroke="#c9a227" strokeWidth="1.5">
            <defs>
              <linearGradient id="half"><stop offset="50%" stopColor="#c9a227" /><stop offset="50%" stopColor="transparent" /></linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-ink">{Number(rating).toFixed(1)}</span>
      <span className="text-sm text-stone">({count})</span>
    </div>
  );
}

export default async function StorePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations("seller");

  const data = await fetchStore(slug, locale);
  if (!data) notFound();

  const { store, products } = data;
  const logoUrl = store.logo_path ? getImageUrl(store.logo_path) : null;
  const bannerUrl = store.banner_path ? getImageUrl(store.banner_path) : null;
  const shopPhotoUrl = store.shop_photo_path ? getImageUrl(store.shop_photo_path) : null;
  const portfolio: string[] = Array.isArray(store.portfolio_paths) ? store.portfolio_paths : [];

  const memberYear = new Date(store.created_at).getFullYear();
  const levelLabels: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" };

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero Banner */}
      <div className="relative h-56 md:h-80 w-full overflow-hidden bg-gradient-to-br from-[#2a1f0e] to-[#1a1610]">
        {bannerUrl ? (
          <Image src={bannerUrl} alt={store.store_name} fill className="object-cover opacity-70" priority />
        ) : (
          <div className="absolute inset-0">
            {/* Decorative zellige pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="zellige" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#c9a227" strokeWidth="0.8"/>
                  <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke="#c9a227" strokeWidth="0.4"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#zellige)"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {/* Store identity card — overlaps banner */}
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-stone/10 p-5 md:p-7">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-stone/15 bg-sand overflow-hidden shrink-0 shadow-sm">
                {logoUrl ? (
                  <Image src={logoUrl} alt={store.store_name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-display text-gold-deep bg-gold/10">
                    {store.store_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl text-ink leading-tight">{store.store_name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {store.rating > 0 && (
                        <StarRating rating={Number(store.rating)} count={store.total_reviews} />
                      )}
                      {store.level && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/15 text-gold-deep">
                          ✦ {levelLabels[store.level] ?? store.level}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Contact button — client component */}
                  <ContactSellerButton sellerId={store.user_id} sellerName={store.store_name} locale={locale} />
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-stone/10">
                  <div className="text-center">
                    <p className="text-lg font-bold text-ink">{products.length}</p>
                    <p className="text-xs text-stone">{t("storeProducts")}</p>
                  </div>
                  {store.total_orders > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{store.total_orders}</p>
                      <p className="text-xs text-stone">{t("orders")}</p>
                    </div>
                  )}
                  {store.total_reviews > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{store.total_reviews}</p>
                      <p className="text-xs text-stone">{t("totalReviews")}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-bold text-ink">{memberYear}</p>
                    <p className="text-xs text-stone">{t("memberSince")}</p>
                  </div>
                  {store.response_time_hours && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{store.response_time_hours}h</p>
                      <p className="text-xs text-stone">{locale === "ar" ? "وقت الرد" : locale === "fr" ? "Temps de réponse" : "Response time"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {store.store_description && (
              <p className="mt-5 text-sm text-stone leading-relaxed border-t border-stone/10 pt-4">
                {store.store_description}
              </p>
            )}
          </div>
        </div>

        {/* About the artisan */}
        {(store.seller_bio || shopPhotoUrl) && (
          <div className="mb-10 bg-white rounded-2xl border border-stone/10 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {shopPhotoUrl && (
                <div className="relative h-52 md:h-auto md:w-64 shrink-0">
                  <Image src={shopPhotoUrl} alt={store.store_name} fill className="object-cover" />
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-0.5 bg-gold" />
                  <h2 className="font-display text-lg text-ink">
                    {locale === "ar" ? "عن الحرفي" : locale === "fr" ? "À propos de l'artisan" : "About the artisan"}
                  </h2>
                </div>
                {store.seller_bio && (
                  <p className="text-sm text-stone leading-relaxed">{store.seller_bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-0.5 bg-gold" />
              <h2 className="font-display text-xl text-ink">
                {locale === "ar" ? "معرض الأعمال" : locale === "fr" ? "Portfolio" : "Portfolio"}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {portfolio.map((path, i) => {
                const url = getImageUrl(path);
                if (!url) return null;
                return (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-sand group">
                    <Image src={url} alt={`${store.store_name} ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zellige divider */}
        <div className="zellige-divider mb-8" />

        {/* Products */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-gold" />
              <h2 className="font-display text-xl text-ink">
                {t("storeProducts")}
                <span className="text-stone text-base font-sans ms-2">({products.length})</span>
              </h2>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone/10">
              <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9c8c7a" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
              </div>
              <p className="text-stone mb-3">{t("noStoreProducts")}</p>
              <Link href="/products" className="text-gold-deep hover:underline text-sm font-medium">
                {t("browseAllProducts")} →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((product: any) => {
                const primaryImage = product.images?.[0];
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    rating={product.rating}
                    categoryName={product.category?.localised_name ?? product.category?.name}
                    imagePath={primaryImage?.image_path}
                    sellerId={product.seller_id ?? 0}
                    stockQuantity={product.stock_quantity ?? 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
