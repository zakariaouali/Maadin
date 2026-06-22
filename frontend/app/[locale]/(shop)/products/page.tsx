"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  rating: string;
  primary_image?: { image_path: string };
  category?: { name: string };
  seller?: { store_name: string };
}

const API_URL = "http://localhost:8000/api";
const STORAGE_URL = "http://localhost:8000/storage";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const loadCategories = async () => {
    const { data } = await axios.get(`${API_URL}/categories`);
    setCategories(data);
  };

  const loadProducts = async () => {
    setLoading(true);
    const params: Record<string, string> = { sort };
    if (categoryId) params.category_id = categoryId;
    if (search) params.search = search;

    const { data } = await axios.get(`${API_URL}/products`, { params });
    setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [categoryId, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              style={{ border: "1px solid #ddd", padding: 12, textDecoration: "none", color: "inherit" }}
            >
              {p.primary_image && (
                <img
                  src={`${STORAGE_URL}/${p.primary_image.image_path}`}
                  alt={p.name}
                  style={{ width: "100%", height: 150, objectFit: "cover" }}
                />
              )}
              <h3 style={{ fontSize: 14 }}>{p.name}</h3>
              <p style={{ fontSize: 12, color: "#666" }}>{p.seller?.store_name}</p>
              <p style={{ fontWeight: "bold" }}>{p.price} MAD</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}