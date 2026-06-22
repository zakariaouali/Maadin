import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

const API_URL = "http://localhost:8000/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  rating: string;
  primary_image?: { image_path: string };
  seller?: { store_name: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?sort=popular&per_page=4`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone/20">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28 text-center">
          <Image
            src="/logo.png"
            alt="Marrakech Maadine"
            width={180}
            height={110}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="font-display text-4xl md:text-6xl text-ink mb-4 leading-tight">
            {t("title")}
          </h1>
          <p className="text-stone text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t("subtitle")}
          </p>
          <Link
            href="/products"
            className="inline-block bg-gold hover:bg-gold-deep text-ink font-medium px-8 py-3 rounded-sm transition-colors"
          >
            {t("cta")}
          </Link>
        </div>
        <div className="zellige-divider" />
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-8 text-center">
            {t("shopByCategory")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category_id=${cat.id}`}
                className="group bg-white border border-stone/20 rounded-sm p-6 text-center hover:border-gold transition-colors"
              >
                <span className="font-display text-lg text-ink group-hover:text-gold-deep transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="zellige-divider mx-6" />

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl text-ink">
            {t("featuredProducts")}
          </h2>
          <Link href="/products" className="text-gold-deep hover:underline text-sm">
            {t("viewAll")}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-stone">{t("noProducts")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group block"
              >
                <div className="aspect-square bg-sand-dark rounded-sm overflow-hidden mb-3 relative">
                  {p.primary_image && (
                    <Image
                      src={`http://localhost:8000/storage/${p.primary_image.image_path}`}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="text-sm text-ink font-medium line-clamp-1">{p.name}</h3>
                <p className="text-xs text-stone mb-1">{p.seller?.store_name}</p>
                <p className="text-gold-deep font-semibold">{p.price} MAD</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}