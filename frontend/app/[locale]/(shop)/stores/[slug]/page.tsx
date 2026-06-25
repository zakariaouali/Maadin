import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import { ProductCard } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function fetchStore(slug: string) {
  const res = await fetch(`${API}/stores/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch store");
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const data = await fetchStore(slug);
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

export default async function StorePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("seller");

  const data = await fetchStore(slug);
  if (!data) notFound();

  const { store, products } = data;
  const logoUrl = getImageUrl(store.logo_path);
  const bannerUrl = getImageUrl(store.banner_path);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-sand-dark w-full overflow-hidden">
        {bannerUrl ? (
          <Image src={bannerUrl} alt={store.store_name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sand to-sand-dark" />
        )}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* Store header — overlaps the banner */}
        <div className="relative -mt-12 mb-8 flex items-end gap-5">
          {/* Logo */}
          <div className="relative w-24 h-24 rounded-sm border-4 border-white bg-sand-dark overflow-hidden shrink-0 shadow-sm">
            {logoUrl ? (
              <Image src={logoUrl} alt={store.store_name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone/30">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 pb-1">
            <h1 className="font-display text-2xl text-ink leading-tight">{store.store_name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-stone">
              {store.rating > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-gold">★</span>
                  {Number(store.rating).toFixed(1)}
                  <span className="text-stone/60">({store.total_reviews})</span>
                </span>
              )}
              {store.total_orders > 0 && (
                <span>{store.total_orders} {t("orders")}</span>
              )}
              <span>{t("memberSince")} {new Date(store.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {store.store_description && (
          <p className="text-stone text-sm leading-relaxed mb-8 max-w-2xl">
            {store.store_description}
          </p>
        )}

        <div className="zellige-divider mb-8" />

        {/* Products */}
        <div className="mb-12">
          <h2 className="font-display text-xl text-ink mb-6">
            {t("storeProducts")} <span className="text-stone text-base font-sans">({products.length})</span>
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-16 text-stone">
              <p>{t("noStoreProducts")}</p>
              <Link href="/products" className="text-gold-deep hover:underline text-sm mt-2 inline-block">
                {t("browseAllProducts")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product: any) => {
                const primaryImage = product.images?.find((i: any) => i.is_primary) ?? product.images?.[0];
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    rating={product.rating}
                    categoryName={product.category?.name}
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
