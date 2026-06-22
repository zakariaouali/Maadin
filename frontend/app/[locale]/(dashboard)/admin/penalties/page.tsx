"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Penalty {
  id: number;
  reason: string;
  description: string;
  penalty_type: string;
  created_at: string;
  seller: { store_name: string };
  admin: { name: string };
}

interface Seller {
  id: number;
  store_name: string;
}

export default function AdminPenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sellerId, setSellerId] = useState("");
  const [reason, setReason] = useState("other");
  const [penaltyType, setPenaltyType] = useState("warning");
  const [description, setDescription] = useState("");

  const load = async () => {
    const [penaltiesRes, sellersRes] = await Promise.all([
      api.get("/admin/penalties"),
      api.get("/admin/sellers"),
    ]);
    setPenalties(penaltiesRes.data.data);
    setSellers(sellersRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/penalties", {
        seller_id: Number(sellerId),
        reason,
        penalty_type: penaltyType,
        description,
      });
      setSellerId("");
      setDescription("");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply penalty");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Penalties</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, marginBottom: 24 }}>
        <select value={sellerId} onChange={(e) => setSellerId(e.target.value)} required>
          <option value="">Select seller</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.store_name}</option>
          ))}
        </select>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="fake_stock">Fake stock</option>
          <option value="delayed_order">Delayed order</option>
          <option value="bad_behavior">Bad behavior</option>
          <option value="other">Other</option>
        </select>
        <select value={penaltyType} onChange={(e) => setPenaltyType(e.target.value)}>
          <option value="warning">Warning</option>
          <option value="suspension">Suspension</option>
          <option value="ban">Ban</option>
        </select>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Apply Penalty</button>
      </form>

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Seller</th>
            <th>Reason</th>
            <th>Type</th>
            <th>Description</th>
            <th>Admin</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {penalties.map((p) => (
            <tr key={p.id}>
              <td>{p.seller.store_name}</td>
              <td>{p.reason}</td>
              <td>{p.penalty_type}</td>
              <td>{p.description}</td>
              <td>{p.admin.name}</td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}