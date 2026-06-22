"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  has_blocked_content: boolean;
  created_at: string;
}

interface ConversationDetail {
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [content, setContent] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await api.get(`/messages/conversations/${conversationId}`);
    setMessages(data.messages);
    setConversation(data.conversation);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setWarning("");

    try {
      const { data } = await api.post("/messages/send", {
        conversation_id: Number(conversationId),
        content,
      });
      setContent("");
      if (data.warning) setWarning(data.warning);
      await load();
    } catch (err: any) {
      setWarning(err.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) return <p>Loading...</p>;

  const otherPerson = conversation
    ? (conversation.buyer.id === user?.id ? conversation.seller : conversation.buyer)
    : null;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Chat with {otherPerson?.name}</h1>

      <div style={{ border: "1px solid #ddd", height: 400, overflowY: "auto", padding: 12, marginBottom: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.sender_id === user?.id ? "right" : "left",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.sender_id === user?.id ? "#dcf8c6" : "#f1f0f0",
                padding: "6px 12px",
                borderRadius: 8,
                maxWidth: "70%",
              }}
            >
              {m.content}
              {m.has_blocked_content && (
                <div style={{ fontSize: 11, color: "#c0392b" }}>⚠ Contact info was hidden</div>
              )}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {warning && <p style={{ color: "orange" }}>{warning}</p>}

      <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}