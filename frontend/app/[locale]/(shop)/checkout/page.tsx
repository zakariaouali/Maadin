"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCartStore();

  const idempotencyKey = useMemo(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    []
  );

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <p style={{ padding: 24 }}>Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 24 }}>
        <p>You need to log in to check out.</p>
        <button onClick={() => router.push("/login")}>Go to Login</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/customer/checkout", {
        idempotency_key: idempotencyKey,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: address,
        shipping_city: city,
        shipping_phone: phone,
        notes,
      });

      clearCart();
      router.push(`/customer/orders?confirmed=${data.length}`);
    } catch (err: any) {
      setError(err.response?.data?.errors?.items?.[0] || err.response?.data?.message || "Checkout failed");
    }

    setSubmitting(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h1>Checkout</h1>

      <h3>Order Summary</h3>
      {items.map((item) => (
        <p key={item.product_id}>
          {item.name} × {item.quantity} — {(item.price * item.quantity).toFixed(2)} MAD
        </p>
      ))}
      <p style={{ fontWeight: "bold" }}>Total: {totalPrice().toFixed(2)} MAD</p>

      <h3>Shipping Information</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ fontSize: 12, color: "#666" }}>Payment: Cash on Delivery</p>

        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}