"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { Button, Alert } from "@/components/ui";

interface ProductActionsProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock_quantity: number;
    seller?: { id: number; user_id: number; store_name: string };
    primaryImagePath?: string;
  };
  initialInWishlist: boolean;
}

export function ProductActions({ product, initialInWishlist }: ProductActionsProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const [added, setAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState("");

  const outOfStock = product.stock_quantity === 0;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image_path: product.primaryImagePath ?? null,
      seller_id: product.seller?.id ?? 0,
      seller_name: product.seller?.store_name ?? "",
      stock_quantity: product.stock_quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/customer/wishlist/${product.id}`);
        setInWishlist(false);
      } else {
        await api.post("/customer/wishlist", { product_id: product.id });
        setInWishlist(true);
      }
    } catch { /* ignore */ }
    setWishlistLoading(false);
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!messageText.trim() || !product.seller) return;
    setMessageSending(true);
    setMessageError("");
    try {
      const { data } = await api.post("/messages/send", {
        receiver_id: product.seller.user_id,
        product_id: product.id,
        content: messageText,
      });
      router.push(`/messages/${data.conversation_id}`);
    } catch {
      setMessageError("Failed to send message. Please try again.");
    }
    setMessageSending(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cart button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={outOfStock}
        onClick={handleAddToCart}
      >
        {outOfStock ? t("outOfStock") : added ? `✓ ${t("added")}` : t("addToCart")}
      </Button>

      <div className="flex gap-3">
        {/* Wishlist */}
        <Button
          variant="secondary"
          className="flex-1"
          loading={wishlistLoading}
          onClick={handleWishlist}
        >
          {inWishlist ? `♥ ${t("inWishlist")}` : `♡ ${t("addToWishlist")}`}
        </Button>

        {/* Message seller */}
        {product.seller && (
          <Button
            variant="ghost"
            className="flex-1 border border-stone/30"
            onClick={() => setShowMessage((v) => !v)}
          >
            {t("messageSeller")}
          </Button>
        )}
      </div>

      {/* Message box */}
      {showMessage && (
        <div className="flex flex-col gap-2 p-4 border border-stone/20 rounded-sm bg-sand">
          {messageError && <Alert type="error">{messageError}</Alert>}
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t("askQuestion")}
            rows={3}
            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
          />
          <Button
            variant="primary"
            size="sm"
            loading={messageSending}
            onClick={handleSendMessage}
            className="self-end"
          >
            {t("send")}
          </Button>
        </div>
      )}
    </div>
  );
}
