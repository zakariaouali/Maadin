"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: string;
  shipping_city: string;
  created_at: string;
  items: OrderItem[];
  seller?: { store_name: string };
}

interface MyReview {
  id: number;
  product_id: number;
}

export default function CustomerOrdersPage() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ orderId: number; productId: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [ordersRes, reviewsRes] = await Promise.all([
      api.get("/customer/orders"),
      api.get("/customer/reviews"),
    ]);
    setOrders(ordersRes.data);
    setMyReviews(reviewsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const hasReviewed = (productId: number) => myReviews.some((r) => r.product_id === productId);

  const startReview = (orderId: number, productId: number) => {
    setReviewing({ orderId, productId });
    setRating(5);
    setContent("");
    setError("");
  };

  const submitReview = async () => {
    if (!reviewing) return;
    setError("");
    try {
      await api.post("/customer/reviews", {
        order_id: reviewing.orderId,
        product_id: reviewing.productId,
        rating,
        content,
      });
      setReviewing(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Orders</h1>

      {confirmed && <p style={{ color: "green" }}>{confirmed} order(s) placed successfully!</p>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
            <p>
              <strong>{order.order_number}</strong> — {order.seller?.store_name} — Status:{" "}
              <strong>{order.status}</strong>
            </p>
            <p>Total: {order.total_price} MAD | Shipping to: {order.shipping_city}</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id} style={{ marginBottom: 8 }}>
                  {item.product_name} × {item.quantity} — {item.price_at_purchase} MAD
                  {order.status === "delivered" && (
                    hasReviewed(item.product_id) ? (
                      <span style={{ color: "green", marginLeft: 8 }}>✓ Reviewed</span>
                    ) : (
                      <button
                        style={{ marginLeft: 8 }}
                        onClick={() => startReview(order.id, item.product_id)}
                      >
                        Leave a review
                      </button>
                    )
                  )}

                  {reviewing?.orderId === order.id && reviewing?.productId === item.product_id && (
                    <div style={{ marginTop: 8, padding: 8, background: "#f5f5f5" }}>
                      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} stars</option>
                        ))}
                      </select>
                      <textarea
                        placeholder="Write your review..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ display: "block", width: "100%", marginTop: 8 }}
                      />
                      {error && <p style={{ color: "red" }}>{error}</p>}
                      <button onClick={submitReview}>Submit</button>
                      <button onClick={() => setReviewing(null)}>Cancel</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}