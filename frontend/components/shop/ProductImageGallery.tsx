"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface Props {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: Props) {
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const [selected, setSelected] = useState<ProductImage | undefined>(primary);

  const selectedUrl = selected ? getImageUrl(selected.image_path) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-sand-dark rounded-sm overflow-hidden">
        {selectedUrl ? (
          <Image
            src={selectedUrl}
            alt={productName}
            fill
            className="object-cover transition-opacity duration-200"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone/30">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails — only shown when more than 1 image */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img) => {
            const url = getImageUrl(img.image_path);
            const isActive = selected?.id === img.id;
            return (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-colors ${
                  isActive ? "border-gold" : "border-transparent hover:border-stone/40"
                }`}
              >
                {url && (
                  <Image
                    src={url}
                    alt={productName}
                    fill
                    className="object-cover"
                    sizes="10vw"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
