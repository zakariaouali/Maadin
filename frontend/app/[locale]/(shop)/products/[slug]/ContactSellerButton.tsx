"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Props {
  sellerId: number;
  sellerName: string;
  productId: number;
  productName: string;
  locale: string;
}

export default function ContactSellerButton({ sellerId, sellerName, productId, productName, locale }: Props) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const label   = locale === "ar" ? "تواصل مع البائع" : locale === "fr" ? "Contacter le vendeur" : "Contact seller";
  const title   = locale === "ar" ? `مراسلة ${sellerName}` : locale === "fr" ? `Contacter ${sellerName}` : `Message ${sellerName}`;
  const about   = locale === "ar" ? `بخصوص: ${productName}` : locale === "fr" ? `Au sujet de : ${productName}` : `About: ${productName}`;
  const ph      = locale === "ar" ? "اكتب سؤالك هنا…" : locale === "fr" ? "Écrivez votre question ici…" : "Write your question here…";
  const sendLbl = locale === "ar" ? "إرسال" : locale === "fr" ? "Envoyer" : "Send";

  if (!sellerId || user?.id === sellerId) return null;

  const handleOpen = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setOpen(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      const { data } = await api.post("/messages/send", {
        receiver_id: sellerId,
        product_id: productId,
        content: message.trim(),
      });
      router.push(`/messages/${data.conversation_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? (locale === "ar" ? "فشل الإرسال" : "Failed to send"));
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 w-full border border-stone/30 text-ink text-sm font-medium py-2.5 rounded-lg hover:border-gold-deep hover:text-gold-deep transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#e6c050] to-[#c9a227]" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-display text-xl text-ink">{title}</h2>
                <button onClick={() => setOpen(false)} className="text-stone hover:text-ink transition-colors mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-stone mb-5">{about}</p>

              <form onSubmit={handleSend} className="flex flex-col gap-4">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={ph}
                  rows={5}
                  required
                  autoFocus
                  className="w-full border border-stone/30 rounded-lg px-4 py-3 text-sm outline-none focus:border-gold-deep transition-colors resize-none leading-relaxed"
                />
                {error && <p className="text-xs text-henna bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-stone/30 text-sm text-stone hover:text-ink transition-colors">
                    {locale === "ar" ? "إلغاء" : locale === "fr" ? "Annuler" : "Cancel"}
                  </button>
                  <button type="submit" disabled={sending || !message.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {sending ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    )}
                    {sending ? "…" : sendLbl}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
