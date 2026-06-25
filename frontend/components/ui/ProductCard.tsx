"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  price: string | number;
  rating?: string | number;
  storeName?: string;
  storeSlug?: string;
  storeLogoPath?: string;
  categoryName?: string;
  imagePath?: string;
  sellerId: number;
  stockQuantity?: number;
}

export function ProductCard({
  id, slug, name, price, rating, storeName, storeSlug, storeLogoPath,
  categoryName, imagePath, sellerId, stockQuantity = 0,
}: ProductCardProps) {
  const imageUrl = getImageUrl(imagePath);
  const logoUrl  = getImageUrl(storeLogoPath);
  const addItem  = useCartStore(s => s.addItem);
  const items    = useCartStore(s => s.items);
  const [added, setAdded]   = useState(false);

  const inCart = items.some(i => i.product_id === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id:     id,
      name,
      slug,
      price:          Number(price),
      image_path:     imagePath ?? null,
      seller_id:      sellerId,
      seller_name:    storeName ?? "",
      stock_quantity: stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product image */}
      <Link href={`/products/${slug}`} className="block relative">
        <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: "3/4" }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-sand">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.35">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          )}

          {categoryName && (
            <span className="absolute top-2.5 start-2.5 bg-white/90 text-[9px] uppercase tracking-widest text-stone px-2 py-0.5 rounded-sm">
              {categoryName}
            </span>
          )}

          {/* Add to cart overlay */}
          <button
            onClick={handleAddToCart}
            disabled={stockQuantity === 0}
            className={`absolute bottom-0 inset-x-0 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300
              translate-y-full group-hover:translate-y-0
              ${added
                ? "bg-green-600 text-white"
                : stockQuantity === 0
                  ? "bg-stone/80 text-white cursor-not-allowed"
                  : "bg-ink/90 hover:bg-gold-deep text-white"
              }`}
          >
            {added ? "✓ Added!" : stockQuantity === 0 ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5">
        {/* Store row */}
        {storeName && (
          storeSlug ? (
            <Link href={`/stores/${storeSlug}`} className="flex items-center gap-1.5 group/store w-fit">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center border border-gold/30">
                {logoUrl
                  ? <Image src={logoUrl} alt={storeName} fill sizes="28px" className="object-cover" />
                  : <span className="text-[10px] font-bold text-gold-deep leading-none">{storeName.charAt(0).toUpperCase()}</span>}
              </div>
              <p className="text-[10px] text-stone uppercase tracking-wider truncate group-hover/store:text-gold-deep transition-colors">{storeName}</p>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 w-fit">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gold/15 shrink-0 flex items-center justify-center border border-gold/30">
                {logoUrl
                  ? <Image src={logoUrl} alt={storeName} fill sizes="28px" className="object-cover" />
                  : <span className="text-[10px] font-bold text-gold-deep leading-none">{storeName.charAt(0).toUpperCase()}</span>}
              </div>
              <p className="text-[10px] text-stone uppercase tracking-wider truncate">{storeName}</p>
            </div>
          )
        )}

        {/* Product name */}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:text-gold-deep transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price + rating */}
        <div className="flex items-center justify-between mt-1.5 pt-2 border-t border-stone/10">
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

        {/* Quick add to cart (always visible below fold) */}
        {inCart && (
          <Link href="/cart" className="mt-1 text-center text-[11px] font-medium text-gold-deep hover:underline">
            In cart — view →
          </Link>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
