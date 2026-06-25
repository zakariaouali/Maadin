"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category_id") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const currentSearch = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const value = (form.elements.namedItem("search") as HTMLInputElement).value;
    updateParam("search", value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 flex-1">
        <input
          name="search"
          defaultValue={currentSearch}
          placeholder={t("searchPlaceholder")}
          className="flex-1 border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep"
        />
        <button
          type="submit"
          className="bg-gold hover:bg-gold-deep text-ink px-4 py-2 rounded-sm text-sm transition-colors"
        >
          {t("filterBy")}
        </button>
      </form>

      {/* Category */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam("category_id", e.target.value)}
        className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep bg-white min-w-[160px]"
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep bg-white min-w-[160px]"
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price_low">{t("sortPriceLow")}</option>
        <option value="price_high">{t("sortPriceHigh")}</option>
        <option value="rating">{t("sortRating")}</option>
        <option value="popular">{t("sortPopular")}</option>
      </select>
    </div>
  );
}
