import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProductCard, EmptyState } from "@/components/ui";
import { ProductFilters } from "@/components/shop/ProductFilters";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  rating: string;
  stock_quantity: number;
  primary_image?: { image_path: string };
  seller?: { id: number; store_name: string; store_slug: string; logo_path: string | null };
  category?: { name: string };
}

interface Category {
  id: number;
  name: string;
}

async function fetchProducts(p: {
  category_id?: string;
  search?: string;
  sort?: string;
}): Promise<Product[]> {
  try {
    const q = new URLSearchParams();
    if (p.category_id) q.set("category_id", p.category_id);
    if (p.search) q.set("search", p.search);
    if (p.sort) q.set("sort", p.sort);
    q.set("per_page", "24");
    const res = await fetch(`${API_URL}/products?${q}`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; category_id?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { search } = await searchParams;
  const t = await getTranslations({ locale, namespace: "products" });

  const title = search ? `"${search}" – ${t("metaTitle")}` : t("metaTitle");

  return {
    title,
    description: t("metaDescription"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/products`,
      languages: {
        en: `${SITE_URL}/en/products`,
        fr: `${SITE_URL}/fr/products`,
        ar: `${SITE_URL}/ar/products`,
      },
    },
    openGraph: {
      title,
      description: t("metaDescription"),
      url: `${SITE_URL}/${locale}/products`,
      siteName: "Marrakech Maadine",
      type: "website",
    },
    robots: { index: !search, follow: true },
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category_id?: string; search?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { category_id, search, sort } = await searchParams;
  const t = await getTranslations({ locale, namespace: "products" });

  const [products, categories] = await Promise.all([
    fetchProducts({ category_id, search, sort }),
    fetchCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">{t("title")}</h1>

      {/* Filters are client-side but wrapped in Suspense for useSearchParams */}
      <Suspense>
        <ProductFilters categories={categories} />
      </Suspense>

      {products.length === 0 ? (
        <EmptyState
          title={t("noProducts")}
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              rating={p.rating}
              storeName={p.seller?.store_name}
              storeSlug={p.seller?.store_slug}
              storeLogoPath={p.seller?.logo_path ?? undefined}
              categoryName={p.category?.name}
              imagePath={p.primary_image?.image_path}
              sellerId={p.seller?.id ?? 0}
              stockQuantity={p.stock_quantity ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
