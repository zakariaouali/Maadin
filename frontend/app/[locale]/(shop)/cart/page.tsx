"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const STORAGE_URL = "http://localhost:8000/storage";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link href="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Cart</h1>

      <table border={1} cellPadding={8} style={{ width: "100%", marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.product_id}>
              <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {item.image_path && (
                  <img
                    src={`${STORAGE_URL}/${item.image_path}`}
                    alt={item.name}
                    style={{ width: 50, height: 50, objectFit: "cover" }}
                  />
                )}
                <Link href={`/products/${item.slug}`}>{item.name}</Link>
              </td>
              <td>{item.seller_name}</td>
              <td>{item.price} MAD</td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={item.stock_quantity}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                  style={{ width: 60 }}
                />
              </td>
              <td>{(item.price * item.quantity).toFixed(2)} MAD</td>
              <td>
                <button onClick={() => removeItem(item.product_id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total: {totalPrice().toFixed(2)} MAD</h2>

      <Link href="/checkout">
        <button>Proceed to Checkout</button>
      </Link>
    </div>
  );
}