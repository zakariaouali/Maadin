import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const LOCALES = ["en", "fr", "ar"];

async function getProductSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/products?per_page=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}

async function getCategorySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const cats = await res.json();
    return cats.map((c: { slug: string }) => c.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categorySlugs] = await Promise.all([
    getProductSlugs(),
    getCategorySlugs(),
  ]);

  const staticRoutes: {
    path: string;
    changeFrequency: "daily" | "hourly" | "monthly" | "yearly";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/products", changeFrequency: "hourly", priority: 0.8 },
    { path: "/plans", changeFrequency: "monthly", priority: 0.5 },
    { path: "/support", changeFrequency: "monthly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages per locale
  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${SITE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}${route.path}`])
          ),
        },
      });
    }
  }

  // Product pages per locale
  for (const locale of LOCALES) {
    for (const slug of productSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}/products/${slug}`])
          ),
        },
      });
    }
  }

  // Category filter pages (crawlable, no-index for non-canonical)
  for (const locale of LOCALES) {
    for (const slug of categorySlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/products?category_id=${slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return entries;
}
