"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Badge, Button, PageHeader, Spinner } from "@/components/ui";
import { CategoryIcon } from "@/components/support/CategoryIcon";

interface Ticket {
  id: number;
  user_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  role: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  admin_reply: string | null;
  admin_notes: string | null;
  replied_at: string | null;
  created_at: string;
  user: { id: number; name: string; email: string; role: string } | null;
  replied_by?: { name: string } | null;
}

interface Stats { open: number; in_progress: number; resolved: number; total: number }

const STATUS_VARIANT: Record<string, "warning" | "default" | "success" | "danger"> = {
  open: "warning", in_progress: "default", resolved: "success", closed: "danger",
};
const PRIORITY_COLOR: Record<string, string> = {
  low: "text-stone bg-stone/10", normal: "text-amber-700 bg-amber-50", high: "text-henna bg-henna/10",
};

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminSupportPage() {
  const t = useTranslations("support");
  const ta = useTranslations("admin");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", search: "" });
  const [saving, setSaving] = useState(false);
  const [reply, setReply] = useState("");
  const [notes, setNotes] = useState("");
  const [replyStatus, setReplyStatus] = useState<"open" | "in_progress" | "resolved" | "closed">("in_progress");

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filters.status)   params.status   = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search)   params.search   = filters.search;
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        api.get("/admin/support", { params }),
        api.get("/admin/support/stats"),
      ]);
      setTickets(ticketsRes.data.data ?? ticketsRes.data);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openTicket = (ticket: Ticket) => {
    setSelected(ticket);
    setReply(ticket.admin_reply ?? "");
    setNotes(ticket.admin_notes ?? "");
    setReplyStatus(ticket.status === "open" ? "in_progress" : ticket.status);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/support/${selected.id}`, {
        admin_reply: reply || null,
        admin_notes: notes || null,
        status: replyStatus,
      });
      setSelected(data);
      setTickets(ts => ts.map(t => t.id === data.id ? data : t));
      setStats(s => s ? { ...s, open: s.open + (data.status !== "open" && selected.status === "open" ? -1 : 0) } : s);
    } catch {}
    setSaving(false);
  };

  const statCards = stats ? [
    { label: t("statusOpen"),        v: stats.open,        color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: t("statusInProgress"),  v: stats.in_progress, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: t("statusResolved"),    v: stats.resolved,    color: "text-green-700 bg-green-50 border-green-200" },
    { label: t("totalTickets"),       v: stats.total,       color: "text-[#1f1b16] bg-white border-stone/15" },
  ] : [];

  return (
    <div className="space-y-5">
      <PageHeader title={t("adminTitle")} />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* ── Ticket list ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <input
              placeholder={ta("search")}
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && load()}
              className="border border-stone/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#c9a96e] flex-1 min-w-40 max-w-56 bg-white"
            />
            {(["", "open", "in_progress", "resolved", "closed"] as const).map(s => (
              <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filters.status === s ? "bg-[#1f1b16] text-white" : "bg-white border border-stone/15 text-stone hover:text-[#1f1b16]"}`}>
                {s ? t(`status_${s}`) : ta("all")}
              </button>
            ))}
            {(["", "order", "account", "billing", "technical", "report", "other"] as const).map(c => (
              c === "" ? null : (
                <button key={c} onClick={() => setFilters(f => ({ ...f, category: f.category === c ? "" : c }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filters.category === c ? "bg-[#1f1b16] text-white" : "bg-white border border-stone/15 text-stone hover:text-[#1f1b16]"}`}>
                  <CategoryIcon category={c} className="w-3.5 h-3.5 inline-block me-1 -mt-0.5" /> {t(`cat_${c}`)}
                </button>
              )
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-stone italic text-center py-12">{t("noTicketsAdmin")}</p>
          ) : (
            <div className="space-y-2">
              {tickets.map(ticket => (
                <button key={ticket.id} onClick={() => openTicket(ticket)}
                  className={`w-full flex items-start gap-3 bg-white rounded-2xl border px-4 py-3.5 text-left transition-all hover:shadow-sm ${selected?.id === ticket.id ? "border-[#c9a96e]/60 shadow-sm" : "border-stone/10"}`}>
                  <span className="shrink-0 mt-0.5 text-stone"><CategoryIcon category={ticket.category} className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium text-[#1f1b16] truncate">{ticket.subject}</p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[ticket.priority]}`}>{ticket.priority}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>{t(`status_${ticket.status}`)}</Badge>
                      <span className="text-[10px] text-stone">{ticket.user?.name ?? ticket.guest_name ?? "Guest"}</span>
                      <span className="text-[10px] text-stone/50">·</span>
                      <span className="text-[10px] text-stone">{timeAgo(ticket.created_at)}</span>
                    </div>
                  </div>
                  {!ticket.admin_reply && ticket.status === "open" && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400 mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail / Reply panel ── */}
        {selected && (
          <div className="w-full lg:w-96 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-stone/10 p-5 space-y-4 sticky top-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={STATUS_VARIANT[selected.status] ?? "default"}>{t(`status_${selected.status}`)}</Badge>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[selected.priority]}`}>{selected.priority}</span>
                  </div>
                  <p className="font-semibold text-sm text-[#1f1b16]">{selected.subject}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-stone hover:text-[#1f1b16]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* User info */}
              <div className="bg-sand/50 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-stone">{t("from")}</span><span className="font-medium text-[#1f1b16]">{selected.user?.name ?? selected.guest_name ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-stone">{ta("email")}</span><span className="font-medium text-[#1f1b16] truncate ms-2">{selected.user?.email ?? selected.guest_email ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-stone">{ta("role")}</span><span className="font-medium text-[#1f1b16] capitalize">{selected.role}</span></div>
                <div className="flex justify-between"><span className="text-stone">{ta("date")}</span><span className="font-medium text-[#1f1b16]">{timeAgo(selected.created_at)}</span></div>
              </div>

              {/* Message */}
              <div>
                <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-1.5">{t("userMessage")}</p>
                <p className="text-sm text-[#1f1b16] leading-relaxed bg-sand/30 rounded-xl px-3 py-2.5 whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Status selector */}
              <div>
                <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-2">{ta("status")}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(["open", "in_progress", "resolved", "closed"] as const).map(s => (
                    <button key={s} onClick={() => setReplyStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${replyStatus === s ? "bg-[#1f1b16] text-white" : "bg-sand text-stone hover:text-[#1f1b16]"}`}>
                      {t(`status_${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply */}
              <div>
                <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-1.5">{t("replyLabel")}</p>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl border border-stone/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 resize-none"
                  rows={4}
                  placeholder={t("replyPlaceholder")}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
              </div>

              {/* Internal notes */}
              <div>
                <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-1.5">{t("internalNotes")}</p>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl border border-stone/20 bg-amber-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
                  rows={2}
                  placeholder={t("internalNotesPlaceholder")}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <p className="text-[10px] text-stone/50 mt-0.5">{t("internalNotesHint")}</p>
              </div>

              <Button variant="primary" className="w-full" loading={saving} onClick={save}>
                {t("saveReply")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
