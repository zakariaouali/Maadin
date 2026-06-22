"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_quantity: number;
  rating: string;
  total_reviews: number;
  images: ProductImage[];
  category?: { name: string };
  seller?: { id: number; user_id: number; store_name: string; store_slug: string; rating: string };
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  customer: { name: string };
}

const API_URL = "http://localhost:8000/api";
const STORAGE_URL = "http://localhost:8000/storage";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products/${slug}`);
        setProduct(data);

        const { data: reviewData } = await axios.get(`${API_URL}/products/${data.id}/reviews`);
        setReviews(reviewData);

        if (isAuthenticated) {
          try {
            const { data: wishlistData } = await api.get("/customer/wishlist");
            setInWishlist(wishlistData.some((w: any) => w.product_id === data.id));
          } catch {
            // ignore wishlist check failure
          }
        }
      } catch {
        setError("Product not found");
      }
      setLoading(false);
    };
    load();
  }, [slug, isAuthenticated]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error || !product) return <p style={{ padding: 24 }}>{error}</p>;

  const primaryImage = product.images.find((i) => i.is_primary) || product.images[0];

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image_path: primaryImage?.image_path || null,
      seller_id: product.seller?.id || 0,
      seller_name: product.seller?.store_name || "",
      stock_quantity: product.stock_quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/customer/wishlist/${product.id}`);
        setInWishlist(false);
      } else {
        await api.post("/customer/wishlist", { product_id: product.id });
        setInWishlist(true);
      }
    } catch {
      // ignore
    }
    setWishlistLoading(false);
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!messageText.trim() || !product.seller) return;

    setMessageSending(true);
    try {
      const { data } = await api.post("/messages/send", {
        receiver_id: product.seller.user_id,
        product_id: product.id,
        content: messageText,
      });
      window.location.href = `/messages/${data.conversation_id}`;
    } catch {
      // ignore for now
    }
    setMessageSending(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 400 }}>
          {product.images.length === 0 && <p>No images</p>}
          {product.images.map((img) => (
            <img
              key={img.id}
              src={`${STORAGE_URL}/${img.image_path}`}
              alt={product.name}
              style={{ width: 120, height: 120, objectFit: "cover" }}
            />
          ))}
        </div>

        <div>
          <h1>{product.name}</h1>
          <p style={{ color: "#666" }}>{product.category?.name}</p>
          <p>
            Sold by <strong>{product.seller?.store_name}</strong> (rating: {product.seller?.rating})
          </p>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{product.price} MAD</p>
          <p>Stock: {product.stock_quantity}</p>
          <p>Rating: {product.rating} ({product.total_reviews} reviews)</p>
          <p>{product.description}</p>

          <button onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
            {product.stock_quantity === 0 ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
          </button>
          <button onClick={toggleWishlist} disabled={wishlistLoading} style={{ marginLeft: 8 }}>
            {inWishlist ? "♥ In Wishlist" : "♡ Add to Wishlist"}
          </button>

          {!showMessageBox ? (
            <button onClick={() => setShowMessageBox(true)} style={{ marginLeft: 8 }}>
              Message Seller
            </button>
          ) : (
            <div style={{ marginTop: 8 }}>
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask the seller a question..."
                style={{ width: 300 }}
              />
              <button onClick={handleSendMessage} disabled={messageSending}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 40, maxWidth: 600 }}>
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
              <p>
                <strong>{r.customer.name}</strong> — {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </p>
              {r.title && <p style={{ fontWeight: "bold" }}>{r.title}</p>}
              <p>{r.content}</p>
              <p style={{ fontSize: 12, color: "#999" }}>
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}