"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface WishlistItem {
  id: number;
  product_id: number;
  product: {
    name: string;
    slug: string;
    price: string;
    primary_image?: { image_path: string };
    seller?: { store_name: string };
  };
}

const STORAGE_URL = "http://localhost:8000/storage";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/customer/wishlist");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId: number) => {
    await api.delete(`/customer/wishlist/${productId}`);
    await load();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Wishlist</h1>
      {items.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: "1px solid #ddd", padding: 12 }}>
              {item.product.primary_image && (
                <img
                  src={`${STORAGE_URL}/${item.product.primary_image.image_path}`}
                  alt={item.product.name}
                  style={{ width: "100%", height: 120, objectFit: "cover" }}
                />
              )}
              <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
              <p>{item.product.price} MAD</p>
              <p style={{ fontSize: 12, color: "#666" }}>{item.product.seller?.store_name}</p>
              <button onClick={() => remove(item.product_id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}