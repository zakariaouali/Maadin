"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Props {
  sellerId: number;
  sellerName: string;
  locale: string;
}

export default function ContactSellerButton({ sellerId, sellerName, locale }: Props) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const label = locale === "ar" ? "تواصل مع البائع" : locale === "fr" ? "Contacter le vendeur" : "Contact seller";
  const placeholder = locale === "ar" ? "اكتب رسالتك هنا…" : locale === "fr" ? "Écrivez votre message ici…" : "Write your message here…";
  const sendLabel = locale === "ar" ? "إرسال الرسالة" : locale === "fr" ? "Envoyer" : "Send message";
  const sendingLabel = locale === "ar" ? "جاري الإرسال…" : locale === "fr" ? "Envoi…" : "Sending…";
  const title = locale === "ar" ? `مراسلة ${sellerName}` : locale === "fr" ? `Contacter ${sellerName}` : `Message ${sellerName}`;
  const loginPrompt = locale === "ar" ? "يجب تسجيل الدخول أولاً" : locale === "fr" ? "Connectez-vous pour envoyer un message" : "Sign in to send a message";

  // Don't show if no valid sellerId or viewing own store
  if (!sellerId || user?.id === sellerId) return null;

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
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
        content: message.trim(),
      });
      router.push(`/messages/${data.conversation_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? (locale === "ar" ? "فشل الإرسال" : locale === "fr" ? "Échec de l'envoi" : "Failed to send"));
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-gold-deep transition-colors shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {label}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            {/* Gold top bar */}
            <div className="h-1 bg-gradient-to-r from-[#c9a227] via-[#e6c050] to-[#c9a227]" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-ink">{title}</h2>
                  <p className="text-xs text-stone mt-1">
                    {locale === "ar" ? "سيتلقى البائع رسالتك مباشرة" : locale === "fr" ? "Le vendeur recevra votre message directement" : "The seller will receive your message directly"}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="text-stone hover:text-ink transition-colors mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSend} className="flex flex-col gap-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholder}
                  rows={5}
                  required
                  autoFocus
                  className="w-full border border-stone/30 rounded-lg px-4 py-3 text-sm text-ink outline-none focus:border-gold-deep transition-colors resize-none leading-relaxed"
                />

                {error && (
                  <p className="text-xs text-henna bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-stone/30 text-sm text-stone hover:text-ink hover:border-stone/50 transition-colors"
                  >
                    {locale === "ar" ? "إلغاء" : locale === "fr" ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-gold text-ink text-sm font-semibold hover:bg-gold-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        {sendingLabel}
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        {sendLabel}
                      </>
                    )}
                  </button>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-stone">{loginPrompt}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
