"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { Pager } from "@/components/ui/Pager";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import api, { apiErrorMessage } from "@/lib/api";
import { Badge, Button, Modal, PageHeader, Spinner, Alert } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/i18n-helpers";

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
  id: number;
  buyer: { id: number; name: string };
  seller: { id: number; name: string };
  store_name: string | null;
  /** true when the team runs this store and can answer for it */
  can_reply: boolean;
  messages: Message[];
}

function AdminConversations() {
  const tu = useTranslations("ui");
  const t = useTranslations("admin");
  const params = useSearchParams();

  const [tab, setTab] = useState<"all" | "flagged">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pg, setPg] = useState({ last: 1, total: 0 });

  // The thread being read. Opened from the list, or straight from an alert link (?open=ID).
  const [openId, setOpenId] = useState<number | null>(() => Number(params.get("open")) || null);
  const [thread, setThread] = useState<ConversationDetail | null>(null);
  const [threadVersion, setThreadVersion] = useState(0);
  const threadLoading = openId !== null && thread?.id !== openId;

  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = tab === "flagged" ? { flagged_only: true } : {};
      const res = await api.get("/admin/conversations", { params: { ...query, page } });
      setConversations(res.data?.data ?? res.data ?? []);
      setPg({ last: res.data?.last_page ?? 1, total: res.data?.total ?? 0 });
    } catch {
      setError(tu("failedLoadConversations"));
    } finally {
      setLoading(false);
    }
  }, [tab, page, tu]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (openId === null) return;
    let alive = true;
    api.get(`/admin/conversations/${openId}`)
      .then((res) => { if (alive) setThread(res.data?.data ?? res.data); })
      .catch(() => { if (alive) { setOpenId(null); setError(tu("failedLoadConversations")); } });
    return () => { alive = false; };
  }, [openId, threadVersion, tu]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/conversations/${deleteId}`);
      setSuccess(t("conversationDeleted"));
      setDeleteId(null);
      fetchConversations();
    } catch {
      setError(tu("failedDeleteConversation"));
    } finally {
      setDeleting(false);
    }
  };

  const sendReply = async () => {
    if (!thread || !reply.trim()) return;
    setReplying(true);
    setReplyError("");
    try {
      await api.post(`/admin/conversations/${thread.id}/reply`, { content: reply });
      setReply("");
      setThreadVersion((v) => v + 1);
      fetchConversations();
    } catch (e) {
      setReplyError(apiErrorMessage(e, t("failedAction")));
    }
    setReplying(false);
  };

  const closeThread = () => { setOpenId(null); setReply(""); setReplyError(""); };

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
            onClick={() => { setTab("all"); setPage(1); }}
            className={`px-4 py-1.5 rounded-sm text-sm transition-all ${
              tab === "all"
                ? "bg-white text-ink shadow-sm font-medium"
                : "text-stone hover:text-ink"
            }`}
          >
            {t("all")}
          </button>
          <button
            onClick={() => { setTab("flagged"); setPage(1); }}
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
                <th className="text-left px-4 py-3 text-stone font-medium">{tu("lastMessage")}</th>
                <th className="text-left px-4 py-3 text-stone font-medium">{tu("status")}</th>
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
                      ? formatDate(c.last_message_at)
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
                        onClick={() => setOpenId(c.id)}
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

      <Pager page={page} lastPage={pg.last} total={pg.total} onChange={setPage} />

      {/* Thread Modal */}
      <Modal
        open={openId !== null}
        onClose={closeThread}
        title={t("viewThread")}
        maxWidth="max-w-xl"
      >
        {threadLoading || !thread ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-6 text-sm text-stone border-b border-stone/20 pb-3">
              <span>
                <span className="font-medium text-ink">{t("buyer")}:</span>{" "}
                {thread.buyer.name}
              </span>
              <span>
                <span className="font-medium text-ink">{t("seller")}:</span>{" "}
                {thread.store_name ?? thread.seller.name}
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
                          {tu("contactHidden")}
                        </span>
                      ) : (
                        <p dir="auto">{msg.content}</p>
                      )}
                      <p className="text-stone text-xs">
                        {formatDateTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {thread.can_reply ? (
              <div className="space-y-2 border-t border-stone/20 pt-4">
                {replyError && <Alert type="error">{replyError}</Alert>}
                <label htmlFor="conv-reply" className="block text-xs font-medium text-stone uppercase tracking-wide">
                  {t("convReplyTitle", { store: thread.store_name ?? thread.seller.name })}
                </label>
                <textarea
                  id="conv-reply"
                  rows={3}
                  maxLength={2000}
                  value={reply}
                  placeholder={t("convReplyPlaceholder")}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-y"
                />
                <Button loading={replying} disabled={!reply.trim()} onClick={sendReply}>
                  {t("ordSend")}
                </Button>
              </div>
            ) : (
              <p className="border-t border-stone/20 pt-4 text-xs text-stone">{t("convReadOnly")}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t("delete")}
      >
        <p className="text-sm text-stone mb-6">
          {tu("confirmDeleteConversation")}
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

export default function AdminConversationsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
      <AdminConversations />
    </Suspense>
  );
}
