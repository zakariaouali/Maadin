"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge, Button, Modal, PageHeader, Spinner, Alert } from "@/components/ui";

interface Conversation {
  id: number;
  buyer: { id: number; name: string };
  seller: { id: number; name: string; store_name?: string };
  last_message_at: string;
  messages_count: number;
  is_flagged: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  has_blocked_content: boolean;
  created_at: string;
}

interface ConversationDetail {
  buyer: { id: number; name: string };
  seller: { id: number; name: string; store_name?: string };
  messages: Message[];
}

export default function AdminConversationsPage() {
  const t = useTranslations("admin");

  const [tab, setTab] = useState<"all" | "flagged">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [threadOpen, setThreadOpen] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [thread, setThread] = useState<ConversationDetail | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = tab === "flagged" ? { flagged_only: true } : {};
      const res = await api.get("/admin/conversations", { params });
      setConversations(res.data?.data ?? res.data ?? []);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleViewThread = async (id: number) => {
    setThreadOpen(true);
    setThread(null);
    setThreadLoading(true);
    try {
      const res = await api.get(`/admin/conversations/${id}`);
      setThread(res.data?.data ?? res.data);
    } catch {
      setThreadOpen(false);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/conversations/${deleteId}`);
      setSuccess(t("conversationDeleted"));
      setDeleteId(null);
      fetchConversations();
    } catch {
      setError("Failed to delete conversation.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.buyer.name.toLowerCase().includes(q) ||
      c.seller.name.toLowerCase().includes(q) ||
      (c.seller.store_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("conversations")} />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-sand rounded-sm p-1 flex gap-1 w-fit">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-1.5 rounded-sm text-sm transition-all ${
              tab === "all"
                ? "bg-white text-ink shadow-sm font-medium"
                : "text-stone hover:text-ink"
            }`}
          >
            {t("all")}
          </button>
          <button
            onClick={() => setTab("flagged")}
            className={`px-4 py-1.5 rounded-sm text-sm transition-all ${
              tab === "flagged"
                ? "bg-white text-ink shadow-sm font-medium"
                : "text-stone hover:text-ink"
            }`}
          >
            {t("flagged")}
          </button>
        </div>

        <input
          type="text"
          placeholder={t("searchConversations")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep w-full sm:w-64"
        />
      </div>

      <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-stone py-16 text-sm">{t("noConversations")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/20 bg-sand">
                <th className="text-left px-4 py-3 text-stone font-medium">{t("buyer")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("seller")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{t("messagesCount")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">Last Message</th>
                <th className="text-left px-4 py-3 text-stone font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-sand/50 transition-colors">
                  <td className="px-4 py-3 text-ink font-medium">{c.buyer.name}</td>
                  <td className="px-4 py-3 text-ink">
                    {c.seller.store_name ?? c.seller.name}
                  </td>
                  <td className="px-4 py-3 text-stone">{c.messages_count}</td>
                  <td className="px-4 py-3 text-stone">
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.is_flagged && (
                      <Badge variant="danger">{t("flagged")}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewThread(c.id)}
                      >
                        {t("viewThread")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteId(c.id)}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thread Modal */}
      <Modal
        open={threadOpen}
        onClose={() => setThreadOpen(false)}
        title={t("viewThread")}
        maxWidth="lg"
      >
        {threadLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : thread ? (
          <div className="space-y-4">
            <div className="flex gap-6 text-sm text-stone border-b border-stone/20 pb-3">
              <span>
                <span className="font-medium text-ink">{t("buyer")}:</span>{" "}
                {thread.buyer.name}
              </span>
              <span>
                <span className="font-medium text-ink">{t("seller")}:</span>{" "}
                {thread.seller.store_name ?? thread.seller.name}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {thread.messages.map((msg) => {
                const isBuyer = msg.sender_id === thread.buyer.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBuyer ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-sm px-3 py-2 text-sm space-y-1 ${
                        isBuyer
                          ? "bg-white border border-stone/20 text-ink"
                          : "bg-gold/20 text-ink"
                      }`}
                    >
                      {msg.has_blocked_content ? (
                        <span className="text-henna text-xs font-medium">
                          ⚠ Contact info hidden
                        </span>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <p className="text-stone text-xs">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t("delete")}
      >
        <p className="text-sm text-stone mb-6">
          Are you sure you want to delete this conversation? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            {t("delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
