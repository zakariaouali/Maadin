"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Seller } from "@/lib/types";

export default function SellerStorePage() {
  const [store, setStore] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");

  const loadStore = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/seller/store");
      setStore(data);
      setStoreName(data.store_name);
      setDescription(data.store_description || "");
      setPhone(data.phone_number);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStore(null);
      } else {
        setError(err.response?.data?.message || "Failed to load store");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/seller/store", {
        store_name: storeName,
        store_description: description,
        phone_number: phone,
      });
      setSuccess("Store created!");
      await loadStore();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create store");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.put("/seller/store", {
        store_name: storeName,
        store_description: description,
        phone_number: phone,
      });
      setSuccess("Store updated!");
      await loadStore();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update store");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{store ? "My Store" : "Create Your Store"}</h1>

      {store && (
        <p>
          Status: <strong>{store.status}</strong> | Slug:{" "}
          <code>{store.store_slug}</code>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form
        onSubmit={store ? handleUpdate : handleCreate}
        style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}
      >
        <input
          placeholder="Store name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
        />
        <textarea
          placeholder="Store description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit">{store ? "Update Store" : "Create Store"}</button>
      </form>
    </div>
  );
}