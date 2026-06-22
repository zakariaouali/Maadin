"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  created_at: string;
  customer: { name: string; email: string };
  seller: { store_name: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    const { data } = await api.get("/admin/orders", { params });
    setOrders(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>All Orders</h1>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.order_number}</td>
              <td>{o.customer.name}</td>
              <td>{o.seller.store_name}</td>
              <td>{o.status}</td>
              <td>{o.total_price} MAD</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}