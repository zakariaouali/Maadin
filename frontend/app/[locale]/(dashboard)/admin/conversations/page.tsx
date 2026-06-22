"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Conversation {
  id: number;
  last_message_at: string;
  buyer: { name: string };
  seller: { name: string };
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/conversations", {
      params: flaggedOnly ? { flagged_only: 1 } : {},
    });
    setConversations(data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [flaggedOnly]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Conversations</h1>

      <label>
        <input
          type="checkbox"
          checked={flaggedOnly}
          onChange={(e) => setFlaggedOnly(e.target.checked)}
        />
        Show only flagged (contains blocked content)
      </label>

      {conversations.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ddd", padding: 12, marginTop: 8 }}>
          <p>{c.buyer.name} ↔ {c.seller.name}</p>
          <p style={{ fontSize: 12, color: "#999" }}>
            Last message: {new Date(c.last_message_at).toLocaleString()}
          </p>
          <Link href={`/admin/conversations/${c.id}`}>View</Link>
        </div>
      ))}
    </div>
  );
}