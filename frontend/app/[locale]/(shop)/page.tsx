import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  rating: string;
  primary_image?: { image_path: string };
  seller?: { store_name: string; store_slug: string; logo_path: string | null };
  category?: { name: string };
}

interface Category {
  id: number;
  name: string;
  name_fr: string | null;
  name_ar: string | null;
  localised_name: string;
  slug: string;
  icon_path: string | null;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?sort=popular&per_page=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch { return []; }
}

async function getCategories(locale: string): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories?locale=${locale}`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { en: `${SITE_URL}/en`, fr: `${SITE_URL}/fr`, ar: `${SITE_URL}/ar` },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${SITE_URL}/${locale}`,
      siteName: "Marrakech Maadine",
      type: "website",
    },
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  default: "◈",
  pottery: "🏺",
  leather: "👜",
  textile: "🧵",
  jewelry: "💎",
  wood: "🪵",
  metal: "⚒️",
  ceramics: "🏺",
  rugs: "🪡",
  lamps: "🪔",
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function FeaturedProductCard({ slug, name, price, rating, storeName, storeSlug, storeLogoPath, categoryName, imagePath }: {
  slug: string; name: string; price: string | number; rating?: string | number;
  storeName?: string; storeSlug?: string; storeLogoPath?: string | null; categoryName?: string; imagePath?: string;
}) {
  const imageUrl = getImageUrl(imagePath);
  const logoUrl = getImageUrl(storeLogoPath ?? undefined);
  return (
    <div
      className="group flex flex-col shrink-0 bg-white rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300"
      style={{ width: "clamp(160px, 22vw, 240px)" }}
    >
      {/* Image links to product */}
      <Link href={`/products/${slug}`} className="block">
        <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: "3/4" }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="240px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-sand-dark">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.35">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          )}
          {categoryName && (
            <span className="absolute top-2.5 start-2.5 bg-white/90 text-[9px] uppercase tracking-widest text-stone px-2 py-0.5 rounded-sm">
              {categoryName}
            </span>
          )}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1">
        {storeName && (
          storeSlug ? (
            <Link href={`/stores/${storeSlug}`} className="flex items-center gap-1.5 group/store w-fit">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center border border-gold/30">
                {logoUrl ? (
                  <Image src={logoUrl} alt={storeName} fill sizes="28px" className="object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-gold-deep leading-none">{storeName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="text-[10px] text-stone uppercase tracking-wider truncate group-hover/store:text-gold-deep transition-colors">{storeName}</p>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 w-fit">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center border border-gold/30">
                {logoUrl ? (
                  <Image src={logoUrl} alt={storeName} fill sizes="28px" className="object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-gold-deep leading-none">{storeName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="text-[10px] text-stone uppercase tracking-wider truncate">{storeName}</p>
            </div>
          )
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:text-gold-deep transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone/10">
          <span className="font-semibold text-ink text-sm">
            {Number(price).toLocaleString()}
            <span className="text-[10px] text-stone font-normal ms-1">MAD</span>
          </span>
          {rating && Number(rating) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-stone">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a227" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories(locale)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tCommon("siteName"),
    url: `${SITE_URL}/${locale}`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/${locale}/products?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const trustItems = [
    {
      label: locale === "ar" ? "حرفيون موثّقون" : locale === "fr" ? "Artisans vérifiés" : "Verified Artisans",
      desc: locale === "ar" ? "كل بائع يمر بعملية التحقق" : locale === "fr" ? "Chaque vendeur est contrôlé" : "Every seller is verified by us",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      label: locale === "ar" ? "مصنوع يدوياً بالكامل" : locale === "fr" ? "100% fait main" : "100% Handmade",
      desc: locale === "ar" ? "منتجات فريدة ذات جودة حرفية" : locale === "fr" ? "Produits uniques de qualité artisanale" : "Unique products with artisan quality",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      ),
    },
    {
      label: locale === "ar" ? "مباشر من الحرفي" : locale === "fr" ? "Direct du créateur" : "Direct from Creator",
      desc: locale === "ar" ? "لا وسيط — المال يذهب للحرفي مباشرة" : locale === "fr" ? "Sans intermédiaire — vente directe" : "No middleman — money goes directly to the maker",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────── */}
      {/* bg-[#2b1f12] shows while video loads — acts as the fallback */}
      <section className="relative h-[90vh] min-h-[560px] overflow-hidden bg-[#2b1f12]">
        {/* Video — z-0, slightly blurred */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
          style={{ filter: "blur(3px)" }}
          aria-hidden="true"
        >
          <source src="/artisan-video.mp4" type="video/mp4" />
        </video>

        {/* Heavy dark overlay — z-10 */}
        <div className="absolute inset-0 z-10 bg-black/60 pointer-events-none" />

        {/* Gradient — stronger at bottom for scroll zone */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Zellige pattern — faint gold shimmer */}
        <div
          className="absolute inset-0 z-10 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #c9a227 0px, #c9a227 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, #c9a227 0px, #c9a227 1px, transparent 1px, transparent 20px)",
          }}
        />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
          {/* Eyebrow — gold glow */}
          <p
            className="text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold mb-5 font-medium"
            style={{ textShadow: "0 0 20px rgba(201,162,39,0.8), 0 0 40px rgba(201,162,39,0.4)" }}
          >
            {tCommon("siteName")}
          </p>

          {/* Headline — white glow */}
          <h1
            className="font-display text-4xl sm:text-5xl md:text-7xl text-white mb-6 leading-tight max-w-4xl"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(201,162,39,0.15)" }}
          >
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/75 text-base sm:text-lg max-w-lg mb-10 leading-relaxed"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.9)" }}
          >
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/products"
              className="bg-gold hover:bg-gold-deep text-ink font-semibold px-9 py-3.5 rounded-sm transition-all text-sm tracking-wide"
              style={{ boxShadow: "0 0 24px rgba(201,162,39,0.55), 0 4px 20px rgba(0,0,0,0.4)" }}
            >
              {t("cta")}
            </Link>
            {categories.length > 0 && (
              <Link
                href="/products"
                className="border border-white/40 hover:border-gold/60 text-white hover:text-gold px-9 py-3.5 rounded-sm transition-all text-sm tracking-wide backdrop-blur-sm"
                style={{ boxShadow: "0 0 16px rgba(255,255,255,0.05), inset 0 0 16px rgba(255,255,255,0.03)" }}
              >
                {locale === "ar" ? "استكشف الفئات" : locale === "fr" ? "Voir les catégories" : "Explore Categories"}
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/30 animate-bounce">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-6 py-6 sm:py-5">
                <div className="text-gold shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-[12px] text-white/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-20 px-6">
          {/* Centered heading */}
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.4em] uppercase text-stone mb-3">
              {locale === "ar" ? "تسوق حسب" : locale === "fr" ? "Parcourir par" : "Browse by"}
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-ink">{t("shopByCategory")}</h2>
            <div className="mx-auto mt-4 zellige-divider w-24 opacity-60" />
          </div>

          {/* Category grid — centered flex so partial last rows stay centred */}
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-5">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category_id=${cat.id}`}
                className="group relative overflow-hidden rounded-sm bg-ink shrink-0 hover:shadow-2xl transition-all duration-500"
                style={{ width: "clamp(140px, 18vw, 210px)", aspectRatio: "3/4" }}
              >
                {/* Image */}
                {cat.icon_path ? (
                  <Image
                    src={cat.icon_path}
                    alt={cat.localised_name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-60"
                    sizes="210px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3d2a14] to-[#1a1108] flex items-center justify-center">
                    <span className="text-5xl opacity-20">{getCategoryIcon(cat.name ?? "")}</span>
                  </div>
                )}

                {/* Permanent dark gradient so title always readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                {/* Hover gold shimmer at top */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/0 to-gold/0 group-hover:from-gold/10 transition-all duration-500" />

                {/* Centered title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                  {/* Gold line */}
                  <div
                    className="h-px bg-gold transition-all duration-500 group-hover:w-10"
                    style={{ width: "24px" }}
                  />
                  <span
                    className="font-display text-base text-white text-center leading-snug transition-colors duration-300 group-hover:text-gold"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
                  >
                    {cat.localised_name}
                  </span>
                  {/* Arrow on hover */}
                  <div className="mt-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Gold border on hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-gold/40 rounded-sm transition-colors duration-500" />
              </Link>
            ))}
          </div>

          {/* View all link */}
          <div className="text-center mt-10">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gold-deep font-medium hover:underline">
              {t("viewAll")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        {/* Centered heading — mirrors the categories section */}
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-stone mb-3">
            {locale === "ar" ? "الأكثر شعبية" : locale === "fr" ? "Les plus populaires" : "Most popular"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-ink">{t("featuredProducts")}</h2>
          <div className="mx-auto mt-4 zellige-divider w-24 opacity-60" />
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center text-stone text-sm">{t("noProducts")}</div>
        ) : (
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-5">
            {products.map((p) => (
              <FeaturedProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                rating={p.rating}
                storeName={p.seller?.store_name}
                storeSlug={p.seller?.store_slug}
                storeLogoPath={p.seller?.logo_path}
                categoryName={p.category?.name}
                imagePath={p.primary_image?.image_path}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gold-deep font-medium hover:underline">
            {t("viewAll")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </section>

      {/* ── BECOME A SELLER CTA ──────────────────────────── */}
      <section className="mx-6 mb-16 rounded-sm overflow-hidden relative">
        <div className="bg-gradient-to-r from-ink to-[#3d2a14] px-8 py-16 md:py-20 text-center relative z-10">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #c9a227 0px, #c9a227 1px, transparent 1px, transparent 16px)",
            }}
          />
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-4 relative">
            {locale === "ar" ? "انضم إلينا" : locale === "fr" ? "Rejoignez-nous" : "Join us"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4 relative max-w-2xl mx-auto leading-tight">
            {locale === "ar"
              ? "أنت حرفي؟ ابدأ البيع اليوم"
              : locale === "fr"
              ? "Vous êtes artisan ? Vendez sur Maadine"
              : "Are you an artisan? Start selling today"}
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto relative text-sm leading-relaxed">
            {locale === "ar"
              ? "انضم إلى مجتمعنا من الحرفيين الموثّقين وابدأ بيع منتجاتك مباشرة"
              : locale === "fr"
              ? "Rejoignez notre communauté d'artisans vérifiés et commencez à vendre directement"
              : "Join our community of verified artisans and start selling your work directly to buyers worldwide"}
          </p>
          <Link
            href="/plans"
            className="relative inline-block bg-gold hover:bg-gold-deep text-ink font-semibold px-10 py-3.5 rounded-sm transition-colors text-sm tracking-wide"
          >
            {locale === "ar" ? "اكتشف خططنا" : locale === "fr" ? "Voir nos forfaits" : "See our plans"}
          </Link>
        </div>
      </section>
    </>
  );
}
