"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import ProductCard from "@/components/ui/ProductCard";
import { Spinner } from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface Product {
  id: number; name: string; slug: string; price: string; rating: string;
  seller_id: number; stock_quantity: number;
  primary_image?: { image_path: string } | null;
  seller?: { store_name: string; store_slug: string; logo_path: string | null } | null;
  category?: { name: string } | null;
}
interface Store {
  id: number; store_name: string; store_slug: string; logo_path: string | null;
  banner_path: string | null; store_description: string | null;
  rating: string; total_reviews: number; products_count: number;
}
interface SearchResult {
  query: string;
  total_products: number;
  total_stores: number;
  products: { data: Product[]; current_page: number; last_page: number; total: number } | null;
  stores: Store[];
}

const SORT_OPTIONS = [
  { value: "relevance", labelEn: "Most Relevant", labelFr: "Plus pertinent", labelAr: "الأكثر صلة" },
  { value: "popular",   labelEn: "Most Popular",  labelFr: "Plus populaire", labelAr: "الأكثر شعبية" },
  { value: "price_low", labelEn: "Price: Low → High", labelFr: "Prix croissant", labelAr: "السعر: الأقل أولاً" },
  { value: "price_high",labelEn: "Price: High → Low", labelFr: "Prix décroissant", labelAr: "السعر: الأعلى أولاً" },
  { value: "rating",    labelEn: "Top Rated",     labelFr: "Mieux notés",    labelAr: "الأعلى تقييماً" },
];

export default function SearchPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}><SearchPageInner /></Suspense>;
}

function SearchPageInner() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const q      = searchParams.get("q") ?? "";
  const tab    = (searchParams.get("tab") ?? "products") as "products" | "stores";
  const sort   = searchParams.get("sort") ?? "relevance";
  const page   = Number(searchParams.get("page") ?? "1");

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const label = (en: string, fr: string, ar: string) => locale === "fr" ? fr : locale === "ar" ? ar : en;

  const fetchResults = useCallback(async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, sort, page: String(page) });
      if (tab === "products") params.set("type", "products");
      if (tab === "stores")   params.set("type", "stores");
      const res = await fetch(`${API_URL}/search?${params}`);
      setResult(await res.json());
    } finally { setLoading(false); }
  }, [q, tab, sort, page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== "page") p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  if (!q.trim()) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-stone text-lg">{label("Enter a search term above.", "Saisissez un terme de recherche.", "أدخل مصطلح بحث.")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink">
          {label(`Results for`, `Résultats pour`, `نتائج عن`)}{" "}
          <span className="text-gold-deep">"{q}"</span>
        </h1>
        {result && !loading && (
          <p className="text-sm text-stone mt-1">
            {result.total_products} {label("product", "produit", "منتج")}{result.total_products !== 1 ? "s" : ""}
            {" · "}
            {result.total_stores} {label("store", "boutique", "متجر")}{result.total_stores !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-stone/10 p-1 w-fit">
        {(["products", "stores"] as const).map(t => (
          <button key={t} onClick={() => setParam("tab", t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gold text-ink" : "text-stone hover:text-ink"}`}>
            {t === "products" ? label("Products", "Produits", "منتجات") : label("Stores", "Boutiques", "متاجر")}
            {result && (
              <span className="ms-1.5 text-[10px] opacity-60">({t === "products" ? result.total_products : result.total_stores})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sort (products only) */}
      {tab === "products" && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone">{label("Sort by:", "Trier par:", "ترتيب:")}</span>
          <select value={sort} onChange={e => setParam("sort", e.target.value)}
            className="text-sm border border-stone/20 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {locale === "fr" ? o.labelFr : locale === "ar" ? o.labelAr : o.labelEn}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {/* Products tab */}
      {!loading && tab === "products" && (
        <>
          {!result?.products?.data?.length ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-2xl">🔍</p>
              <p className="text-lg font-medium text-ink">{label("No products found", "Aucun produit trouvé", "لا توجد منتجات")}</p>
              <p className="text-sm text-stone">{label(`Try a different search term.`, `Essayez un autre terme.`, `جرب مصطلحاً آخر.`)}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {result.products!.data.map(p => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={Number(p.price)}
                    rating={Number(p.rating)}
                    imagePath={p.primary_image?.image_path}
                    storeName={p.seller?.store_name}
                    storeSlug={p.seller?.store_slug}
                    storeLogoPath={p.seller?.logo_path ?? undefined}
                    sellerId={p.seller_id ?? 0}
                    stockQuantity={p.stock_quantity ?? 0}
                  />
                ))}
              </div>
              {/* Pagination */}
              {result.products!.last_page > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  {Array.from({ length: result.products!.last_page }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setParam("page", String(p))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-gold text-ink" : "bg-white border border-stone/20 text-stone hover:border-gold/40"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Stores tab */}
      {!loading && tab === "stores" && (
        <>
          {!result?.stores?.length ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-2xl">🏪</p>
              <p className="text-lg font-medium text-ink">{label("No stores found", "Aucune boutique trouvée", "لا توجد متاجر")}</p>
              <p className="text-sm text-stone">{label("Try a different search term.", "Essayez un autre terme.", "جرب مصطلحاً آخر.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.stores.map(s => {
                const logo   = getImageUrl(s.logo_path);
                const banner = getImageUrl(s.banner_path);
                return (
                  <Link key={s.id} href={`/stores/${s.store_slug}`}
                    className="group bg-white rounded-2xl border border-stone/10 overflow-hidden hover:border-gold/30 hover:shadow-md transition-all">
                    {/* Banner */}
                    <div className="h-24 bg-gradient-to-r from-sand to-stone/10 relative">
                      {banner && <Image src={banner} alt="" fill className="object-cover opacity-60" />}
                      <div className="absolute -bottom-5 start-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border-2 border-white shadow-sm flex items-center justify-center">
                          {logo ? <Image src={logo} alt={s.store_name} width={48} height={48} className="object-cover w-full h-full" /> : <span className="text-lg font-bold text-gold-deep">{s.store_name.charAt(0)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="pt-7 px-4 pb-4">
                      <p className="font-semibold text-ink group-hover:text-gold-deep transition-colors">{s.store_name}</p>
                      {s.store_description && <p className="text-xs text-stone mt-1 line-clamp-2">{s.store_description}</p>}
                      <div className="flex items-center gap-3 mt-3 text-xs text-stone">
                        <span>⭐ {Number(s.rating).toFixed(1)} ({s.total_reviews})</span>
                        <span>· {s.products_count} {label("products", "produits", "منتج")}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
