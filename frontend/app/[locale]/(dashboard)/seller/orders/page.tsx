"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  items: OrderItem[];
  customer?: { name: string; phone: string };
}

const NEXT_STATUS: Record<string, string | null> = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/seller/orders");
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const advanceStatus = async (orderId: number, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setError("");
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: next });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Incoming Orders</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
            <p>
              <strong>{order.order_number}</strong> — Status: <strong>{order.status}</strong>
            </p>
            <p>Customer: {order.customer?.name} ({order.customer?.phone})</p>
            <p>Ship to: {order.shipping_address}, {order.shipping_city}</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product_name} × {item.quantity} — {item.price_at_purchase} MAD
                </li>
              ))}
            </ul>
            <p>Total: {order.total_price} MAD</p>
            {NEXT_STATUS[order.status] && (
              <button onClick={() => advanceStatus(order.id, order.status)}>
                Mark as {NEXT_STATUS[order.status]}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}