"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { Button, EmptyState, PageHeader, Spinner } from "@/components/ui";

interface WishlistItem {
  id: number;
  product_id: number;
  product: {
    name: string;
    slug: string;
    price: string;
    rating: string;
    primary_image?: { image_path: string };
    seller?: { store_name: string; store_slug: string };
  };
}

export default function WishlistPage() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const load = async () => {
    const { data } = await api.get("/customer/wishlist");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (productId: number) => {
    setRemoving(productId);
    await api.delete(`/customer/wishlist/${productId}`);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    setRemoving(null);
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl">
      <PageHeader title={t("myWishlist")} />

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you love by clicking the heart icon on any product page."
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
          action={
            <Link href="/products">
              <Button variant="primary">Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const imageUrl = getImageUrl(item.product.primary_image?.image_path);
            return (
              <div key={item.id} className="bg-white border border-stone/20 rounded-sm overflow-hidden group flex flex-col">
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="relative aspect-square bg-sand-dark block overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone/30">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-ink line-clamp-2 hover:text-gold-deep transition-colors">
                    {item.product.name}
                  </Link>
                  {item.product.seller && (
                    <p className="text-xs text-stone">{item.product.seller.store_name}</p>
                  )}
                  <p className="text-sm font-semibold text-ink mt-auto pt-1">{item.product.price} MAD</p>
                </div>

                {/* Actions */}
                <div className="px-3 pb-3 flex gap-2">
                  <Link href={`/products/${item.product.slug}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">View</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={removing === item.product_id}
                    onClick={() => remove(item.product_id)}
                    className="text-henna hover:text-henna"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
