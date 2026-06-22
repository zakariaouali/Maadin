"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Product {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  seller: { store_name: string };
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const { data } = await api.get("/admin/products", { params });
    setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id: number) => {
    setError("");
    try {
      await api.put(`/admin/products/${id}/toggle-active`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update");
    }
  };

  const remove = async (id: number) => {
    setError("");
    try {
      await api.delete(`/admin/products/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ marginBottom: 16 }}>
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Seller</th>
            <th>Category</th>
            <th>Price</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.seller.store_name}</td>
              <td>{p.category.name}</td>
              <td>{p.price} MAD</td>
              <td>{p.is_active ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => toggleActive(p.id)}>
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}