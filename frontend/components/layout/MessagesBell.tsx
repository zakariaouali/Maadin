"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/image";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  last_message_at: string;
  unread_count: number;
  buyer: { id: number; name: string; avatar_path?: string };
  seller: { id: number; name: string; avatar_path?: string };
  product?: { name: string; slug: string };
  last_message?: { sender_id: number; content: string; is_read: boolean };
}

function Avatar({ name, avatarPath }: { name: string; avatarPath?: string }) {
  const url = avatarPath ? getImageUrl(avatarPath) : null;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gold/20 flex items-center justify-center text-gold-deep font-semibold text-xs">
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

function timeAgo(dateStr: string, locale: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return locale === "ar" ? "الآن" : locale === "fr" ? "à l'instant" : "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return locale === "ar" ? `منذ ${m}د` : locale === "fr" ? `il y a ${m}m` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return locale === "ar" ? `منذ ${h}س` : locale === "fr" ? `il y a ${h}h` : `${h}h ago`;
  }
  const d = Math.floor(diff / 86400);
  return locale === "ar" ? `منذ ${d}ي` : locale === "fr" ? `il y a ${d}j` : `${d}d ago`;
}

export default function MessagesBell() {
  const locale = useLocale();
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data);
      setTotalUnread(data.reduce((sum: number, c: Conversation) => sum + (c.unread_count ?? 0), 0));
    } catch {}
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, [fetch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = locale === "ar" ? "الرسائل" : locale === "fr" ? "Messages" : "Messages";
  const emptyLabel = locale === "ar" ? "لا توجد رسائل" : locale === "fr" ? "Aucun message" : "No messages yet";
  const allLabel = locale === "ar" ? "عرض كل المحادثات" : locale === "fr" ? "Voir toutes les conversations" : "View all conversations";
  const reLabel = locale === "ar" ? "بخصوص:" : locale === "fr" ? "re :" : "re:";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-stone hover:text-gold-deep transition-colors rounded-sm hover:bg-sand"
        aria-label={label}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-henna text-white text-[9px] rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center font-bold animate-pulse">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed top-[72px] end-2 w-[calc(100vw-1rem)] max-w-80 sm:absolute sm:top-auto sm:end-0 sm:mt-2 sm:w-80 bg-white border border-stone/15 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone/10">
            <h3 className="text-sm font-semibold text-ink">{label}</h3>
            {totalUnread === 0 && conversations.length > 0 && (
              <span className="text-[10px] text-stone">
                {locale === "ar" ? "كل شيء مقروء" : locale === "fr" ? "Tout lu" : "All caught up"}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-stone">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm">{emptyLabel}</p>
              </div>
            ) : (
              conversations.map((c) => {
                const other = c.buyer_id === user?.id ? c.seller : c.buyer;
                const hasUnread = c.unread_count > 0;
                return (
                  <Link
                    key={c.id}
                    href={`/messages/${c.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-sand/60 transition-colors border-b border-stone/5 last:border-0 ${hasUnread ? "bg-gold/5" : ""}`}
                  >
                    <div className="relative">
                      <Avatar name={other.name} avatarPath={other.avatar_path} />
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-henna rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${hasUnread ? "font-semibold text-ink" : "text-ink"}`}>
                          {other.name}
                        </p>
                        <span className="text-[10px] text-stone/60 shrink-0">{timeAgo(c.last_message_at, locale)}</span>
                      </div>
                      {c.last_message ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          {c.last_message.sender_id === user?.id && (
                            c.last_message.is_read
                              ? <svg width="14" height="9" viewBox="0 0 16 10" fill="none" className="shrink-0 text-gold-deep"><path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              : <svg width="14" height="9" viewBox="0 0 16 10" fill="none" className="shrink-0 text-stone/40"><path d="M3 5l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                          <p className={`text-[11px] truncate ${hasUnread ? "text-ink font-medium" : "text-stone"}`}>
                            {c.last_message.content}
                          </p>
                        </div>
                      ) : c.product ? (
                        <p className="text-[11px] text-stone truncate mt-0.5">{reLabel} {c.product.name}</p>
                      ) : null}
                    </div>
                    {hasUnread && (
                      <span className="shrink-0 bg-henna text-white text-[9px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold">
                        {c.unread_count}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-stone/10">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-gold-deep hover:text-ink py-3 transition-colors font-medium"
            >
              {allLabel} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
