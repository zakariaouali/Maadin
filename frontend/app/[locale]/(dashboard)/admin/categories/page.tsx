"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/categories", { name });
      setName("");
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div>
      <h1>Categories</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
        <button type="submit">Add Category</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>{cat.is_active ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleDelete(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}