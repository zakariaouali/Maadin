"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Seller {
  id: number;
  store_name: string;
  store_slug: string;
  status: string;
  level: string;
  rating: string;
  user: { name: string; email: string };
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    const { data } = await api.get("/admin/sellers", { params });
    setSellers(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const verify = async (id: number) => {
    setError("");
    try {
      await api.put(`/admin/sellers/${id}/verify`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify");
    }
  };

  const suspend = async (id: number) => {
    setError("");
    try {
      await api.put(`/admin/sellers/${id}/suspend`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to suspend");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Sellers</h1>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="suspended">Suspended</option>
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Store</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Level</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.id}>
              <td>{s.store_name}</td>
              <td>{s.user.name} ({s.user.email})</td>
              <td>{s.status}</td>
              <td>{s.level}</td>
              <td>{s.rating}</td>
              <td>
                {s.status !== "verified" && (
                  <button onClick={() => verify(s.id)}>Verify</button>
                )}
                {s.status !== "suspended" && (
                  <button onClick={() => suspend(s.id)}>Suspend</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}