"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { EmptyState, PageHeader, Spinner } from "@/components/ui";

interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  last_message_at: string;
  unread_count: number;
  buyer: { id: number; name: string; avatar_path?: string };
  seller: { id: number; name: string; avatar_path?: string };
  product?: { name: string; slug: string };
}

function Avatar({ name, avatarPath, size = 40 }: { name: string; avatarPath?: string; size?: number }) {
  const url = avatarPath ? getImageUrl(avatarPath) : null;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 bg-gold/20 flex items-center justify-center text-gold-deep font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/messages/conversations");
    setConversations(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Messages" />

      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start a conversation from any product page by contacting the seller."
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-stone/10 bg-white border border-stone/20 rounded-sm">
          {conversations.map((c) => {
            const other = c.buyer_id === user?.id ? c.seller : c.buyer;
            const hasUnread = c.unread_count > 0;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-sand transition-colors ${hasUnread ? "bg-gold/5" : ""}`}
              >
                <div className="relative">
                  <Avatar name={other.name} avatarPath={other.avatar_path} size={44} />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-henna rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${hasUnread ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                      {other.name}
                    </p>
                    <span className="text-xs text-stone shrink-0">{timeAgo(c.last_message_at)}</span>
                  </div>
                  {c.product && (
                    <p className="text-xs text-stone truncate mt-0.5">re: {c.product.name}</p>
                  )}
                  {hasUnread && (
                    <span className="inline-flex items-center mt-1 bg-henna text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {c.unread_count} unread
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
