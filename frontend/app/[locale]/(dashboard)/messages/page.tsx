"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  last_message_at: string;
  unread_count: number;
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  product?: { name: string; slug: string };
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
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        conversations.map((c) => {
          const otherPerson = c.buyer_id === user?.id ? c.seller : c.buyer;
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              style={{
                display: "block",
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong>{otherPerson.name}</strong>
              {c.product && <span> — about {c.product.name}</span>}
              {c.unread_count > 0 && (
                <span style={{ background: "red", color: "white", borderRadius: 8, padding: "2px 8px", marginLeft: 8 }}>
                  {c.unread_count}
                </span>
              )}
              <p style={{ fontSize: 12, color: "#999" }}>
                {new Date(c.last_message_at).toLocaleString()}
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
}