"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  has_blocked_content: boolean;
  blocked_patterns: string[];
  created_at: string;
}

interface ConversationDetail {
  buyer: { id: number; name: string; email: string };
  seller: { id: number; name: string; email: string };
  messages: Message[];
}

export default function AdminConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/admin/conversations/${id}`);
      setConversation(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const remove = async () => {
    if (!confirm("Remove this conversation permanently?")) return;
    await api.delete(`/admin/conversations/${id}`);
    router.push("/admin/conversations");
  };

  if (loading || !conversation) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>{conversation.buyer.name} ↔ {conversation.seller.name}</h1>
      <p style={{ fontSize: 12, color: "#666" }}>
        {conversation.buyer.email} / {conversation.seller.email}
      </p>

      <button onClick={remove} style={{ marginBottom: 16 }}>Remove Conversation</button>

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        {conversation.messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <strong>{m.sender_id === conversation.buyer.id ? conversation.buyer.name : conversation.seller.name}:</strong>{" "}
            {m.content}
            {m.has_blocked_content && (
              <span style={{ color: "red", fontSize: 11 }}>
                {" "}⚠ blocked: {m.blocked_patterns.join(", ")}
              </span>
            )}
            <div style={{ fontSize: 11, color: "#999" }}>
              {new Date(m.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}