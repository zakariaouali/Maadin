"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { Alert, Button, Spinner } from "@/components/ui";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  has_blocked_content: boolean;
  created_at: string;
}

interface ConversationDetail {
  id: number;
  buyer: { id: number; name: string; avatar_path?: string };
  seller: { id: number; name: string; avatar_path?: string };
  product?: { name: string; slug: string };
}

function Avatar({ name, avatarPath, size = 32 }: { name: string; avatarPath?: string; size?: number }) {
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

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [content, setContent] = useState("");
  const [warning, setWarning] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await api.get(`/messages/conversations/${conversationId}`);
    setMessages(data.messages);
    setConversation(data.conversation);
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 4000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setWarning("");
    try {
      const { data } = await api.post("/messages/send", {
        conversation_id: Number(conversationId),
        content: content.trim(),
      });
      setContent("");
      if (data.warning) setWarning(data.warning);
      await load(true);
    } catch (err: any) {
      setWarning(err.response?.data?.message || "Failed to send message.");
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e as any);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!conversation) return null;

  const other = conversation.buyer.id === user?.id ? conversation.seller : conversation.buyer;
  const me = conversation.buyer.id === user?.id ? conversation.buyer : conversation.seller;

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone/20 mb-4 shrink-0">
        <Link href="/messages" className="text-stone hover:text-ink transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <Avatar name={other.name} avatarPath={other.avatar_path} size={40} />
        <div>
          <p className="font-medium text-ink text-sm">{other.name}</p>
          {conversation.product && (
            <Link href={`/products/${conversation.product.slug}`} className="text-xs text-stone hover:text-gold-deep transition-colors">
              re: {conversation.product.name}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2 pr-1">
        {messages.length === 0 && (
          <p className="text-stone text-sm text-center py-8">No messages yet. Say hi!</p>
        )}

        {messages.map((m) => {
          const isMine = m.sender_id === user?.id;
          const senderName = isMine ? (me.name) : other.name;
          const senderAvatar = isMine ? me.avatar_path : other.avatar_path;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar name={senderName} avatarPath={senderAvatar} size={28} />
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-gold text-ink rounded-br-sm"
                      : "bg-white border border-stone/20 text-ink rounded-bl-sm"
                  }`}
                >
                  {m.content}
                  {m.has_blocked_content && (
                    <p className="text-[11px] text-henna mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Contact info was hidden
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-stone px-1">{formatTime(m.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Warning */}
      {warning && (
        <Alert type="warning" className="mb-2 shrink-0">{warning}</Alert>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex items-end gap-2 pt-3 border-t border-stone/20 shrink-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="flex-1 resize-none border border-stone/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold-deep transition-colors leading-relaxed"
          style={{ maxHeight: 120, overflowY: "auto" }}
        />
        <Button type="submit" variant="primary" loading={sending} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </Button>
      </form>
    </div>
  );
}
