"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Dashboard {
  total_users: number;
  total_customers: number;
  total_sellers: number;
  pending_sellers: number;
  verified_sellers: number;
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  total_revenue: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/admin/analytics/dashboard");
      setData(data);
    };
    load();
  }, []);

  if (!data) return <p>Loading...</p>;

  const cards = [
    { label: "Total Users", value: data.total_users },
    { label: "Customers", value: data.total_customers },
    { label: "Sellers", value: data.total_sellers },
    { label: "Pending Sellers", value: data.pending_sellers },
    { label: "Verified Sellers", value: data.verified_sellers },
    { label: "Total Products", value: data.total_products },
    { label: "Active Products", value: data.active_products },
    { label: "Total Orders", value: data.total_orders },
    { label: "Pending Orders", value: data.pending_orders },
    { label: "Delivered Orders", value: data.delivered_orders },
    { label: "Total Revenue", value: `${data.total_revenue} MAD` },
  ];

  return (
    <div>
      <h1>Platform Analytics</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: "1px solid #ddd", padding: 16 }}>
            <p style={{ fontSize: 12, color: "#666" }}>{c.label}</p>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}