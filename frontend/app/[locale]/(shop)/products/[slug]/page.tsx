import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { getImageUrl } from "@/lib/image";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: string;
  stock_quantity: number;
  rating: string;
  total_reviews: number;
  images: ProductImage[];
  category?: { name: string; slug: string };
  seller?: {
    id: number;
    user_id: number;
    store_name: string;
    store_slug: string;
    rating: string;
    level: string;
  };
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  customer: { name: string };
}

const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

const getReviews = cache(async (productId: number): Promise<Review[]> => {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const description = (product.short_description || product.description || "")
    .replace(/<[^>]+>/g, "")
    .slice(0, 160);

  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];
  const ogImage = primaryImage ? getImageUrl(primaryImage.image_path)! : undefined;

  return {
    title: `${product.name} | Marrakech Maadine`,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products/${slug}`,
      languages: {
        en: `${SITE_URL}/en/products/${slug}`,
        fr: `${SITE_URL}/fr/products/${slug}`,
        ar: `${SITE_URL}/ar/products/${slug}`,
      },
    },
    openGraph: {
      title: product.name,
      description,
      url: `${SITE_URL}/${locale}/products/${slug}`,
      siteName: "Marrakech Maadine",
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const reviews = await getReviews(product.id);
  const t = await getTranslations({ locale, namespace: "products" });

  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  const inStock = product.stock_quantity > 0;

  // JSON-LD: Product structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => getImageUrl(img.image_path)!),
    sku: product.slug,
    brand: product.seller
      ? { "@type": "Brand", name: product.seller.store_name }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "MAD",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: product.seller
        ? { "@type": "Organization", name: product.seller.store_name }
        : undefined,
    },
    ...(product.total_reviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.total_reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-ink transition-colors">{t("title")}</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category_id=${product.category.slug}`}
                className="hover:text-ink transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-ink line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            {product.category && (
              <Link
                href={`/products?category_id=${product.category.slug}`}
                className="text-xs text-stone uppercase tracking-widest hover:text-gold-deep transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.total_reviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={star <= Math.round(Number(product.rating)) ? "#c9a227" : "none"}
                      stroke="#c9a227"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-stone">
                  {product.rating} ({product.total_reviews} {t("reviews")})
                </span>
              </div>
            )}

            {/* Price */}
            <p className="text-3xl font-semibold text-ink">{product.price} MAD</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Badge variant={inStock ? "success" : "danger"}>
                {inStock ? `${product.stock_quantity} ${t("stock")}` : t("outOfStock")}
              </Badge>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-stone leading-relaxed">{product.description}</p>
            )}

            <div className="zellige-divider" />

            {/* Seller */}
            {product.seller && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone">
                  {t("soldBy")}{" "}
                  <Link
                    href={`/stores/${product.seller.store_slug}`}
                    className="text-ink font-medium hover:text-gold-deep transition-colors"
                  >
                    {product.seller.store_name}
                  </Link>
                </span>
                <Link
                  href={`/stores/${product.seller.store_slug}`}
                  className="text-xs text-gold-deep hover:underline"
                >
                  {t("viewStore")} →
                </Link>
              </div>
            )}

            {/* Actions (client component) */}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                stock_quantity: product.stock_quantity,
                seller: product.seller,
                primaryImagePath: primaryImage?.image_path,
              }}
              initialInWishlist={false}
            />
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <div className="zellige-divider mb-10" />
          <h2 className="font-display text-2xl text-ink mb-6">
            {t("reviews")} ({product.total_reviews})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-stone text-sm">{t("noReviews")}</p>
          ) : (
            <div className="flex flex-col divide-y divide-stone/10">
              {reviews.map((r) => (
                <div key={r.id} className="py-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink">{r.customer.name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill={star <= r.rating ? "#c9a227" : "none"}
                            stroke="#c9a227"
                            strokeWidth="1.5"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <time className="text-xs text-stone">
                      {new Date(r.created_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  {r.title && (
                    <p className="text-sm font-medium text-ink mb-1">{r.title}</p>
                  )}
                  <p className="text-sm text-stone leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
