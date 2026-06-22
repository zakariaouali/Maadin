"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  category?: { name: string };
  images?: ProductImage[];
}

const STORAGE_URL = "http://localhost:8000/storage";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/seller/products"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    }
    setLoading(false);
  };

  // Loads full detail (with images) for a single product and merges it in
  const loadProductImages = async (id: number) => {
    const { data } = await api.get(`/seller/products/${id}`);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, images: data.images } : p)));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    await loadProductImages(id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/seller/products", {
        category_id: Number(categoryId),
        name,
        description,
        short_description: shortDescription,
        price: Number(price),
        stock_quantity: Number(stock),
      });
      setName("");
      setDescription("");
      setShortDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/seller/products/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleImageUpload = async (productId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images[]", file));

    try {
      await api.post(`/seller/products/${productId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadProductImages(productId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    }
  };

  const handleSetPrimary = async (productId: number, imageId: number) => {
    try {
      await api.put(`/seller/products/${productId}/images/${imageId}/primary`);
      await loadProductImages(productId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set primary image");
    }
  };

  const handleDeleteImage = async (productId: number, imageId: number) => {
    try {
      await api.delete(`/seller/products/${productId}/images/${imageId}`);
      await loadProductImages(productId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Products</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, marginBottom: 24 }}
      >
        <h3>Add Product</h3>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Short description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        <textarea
          placeholder="Full description (min 50 characters)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
        <input type="number" placeholder="Price (MAD)" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" required />
        <input type="number" placeholder="Stock quantity" value={stock} onChange={(e) => setStock(e.target.value)} required />
        <button type="submit">Add Product</button>
      </form>

      {products.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ddd", marginBottom: 8, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{p.name}</strong> — {p.category?.name} — {p.price} MAD — Stock: {p.stock_quantity}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggleExpand(p.id)}>
                {expandedId === p.id ? "Hide Images" : "Manage Images"}
              </button>
              <button onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>

          {expandedId === p.id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #ccc" }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(p.id, e.target.files)}
              />

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                {p.images?.map((img) => (
                  <div key={img.id} style={{ textAlign: "center" }}>
                    <img
                      src={`${STORAGE_URL}/${img.image_path}`}
                      alt=""
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        border: img.is_primary ? "3px solid green" : "1px solid #ccc",
                      }}
                    />
                    <div style={{ fontSize: 12 }}>
                      {img.is_primary ? (
                        "Primary"
                      ) : (
                        <button onClick={() => handleSetPrimary(p.id, img.id)}>Set Primary</button>
                      )}
                    </div>
                    <button onClick={() => handleDeleteImage(p.id, img.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}