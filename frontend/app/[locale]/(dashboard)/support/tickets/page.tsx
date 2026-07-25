"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";
import { Badge, PageHeader, Spinner } from "@/components/ui";
import { CategoryIcon } from "@/components/support/CategoryIcon";

interface Ticket {
  id: number;
  category: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  admin_reply: string | null;
  replied_at: string | null;
  user_read_at: string | null;
  created_at: string;
}

const STATUS_VARIANT: Record<string, "warning" | "default" | "success" | "danger"> = {
  open:        "warning",
  in_progress: "default",
  resolved:    "success",
  closed:      "danger",
};

const PRIORITY_DOT: Record<string, string> = {
  low:    "bg-stone/40",
  normal: "bg-amber-400",
  high:   "bg-henna",
};


function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MyTicketsPage() {
  const t = useTranslations("support");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const expand = (ticket: Ticket) => {
    const newId = expanded === ticket.id ? null : ticket.id;
    setExpanded(newId);
    // Mark as read if unread reply
    if (newId && ticket.admin_reply && !ticket.user_read_at) {
      api.get(`/support/${ticket.id}`).then(() => {
        setTickets(ts => ts.map(t => t.id === ticket.id ? { ...t, user_read_at: new Date().toISOString() } : t));
      }).catch(() => {});
    }
  };

  useEffect(() => {
    api.get("/support").then(r => setTickets(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader title={t("myTickets")} />
        <Link href="/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-[#1f1b16] text-white px-4 py-2 rounded-xl hover:bg-[#2d2820] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          {t("newTicket")}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sand border border-stone/15 flex items-center justify-center mx-auto text-stone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="font-medium text-[#1f1b16]">{t("noTickets")}</p>
          <p className="text-sm text-stone">{t("noTicketsDesc")}</p>
          <Link href="/support"
            className="inline-flex mt-2 items-center gap-1.5 text-sm font-medium bg-[#1f1b16] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d2820] transition-colors">
            {t("openTicket")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-stone/10 overflow-hidden">
              {/* Row */}
              <button
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-sand/20 transition-colors"
                onClick={() => expand(ticket)}
              >
                <span className="shrink-0 mt-0.5 text-stone"><CategoryIcon category={ticket.category} className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-[#1f1b16]">{ticket.subject}</p>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[ticket.priority]}`} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
                      {t(`status_${ticket.status}`)}
                    </Badge>
                    <span className="text-[10px] text-stone uppercase tracking-wide">{t(`cat_${ticket.category}`)}</span>
                    <span className="text-[10px] text-stone">{timeAgo(ticket.created_at)}</span>
                  </div>
                </div>
                {ticket.admin_reply && !ticket.user_read_at && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                )}
                {ticket.admin_reply && (
                  <span className="shrink-0 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">{t("replied")}</span>
                )}
                <svg className={`shrink-0 text-stone transition-transform ${expanded === ticket.id ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded detail */}
              {expanded === ticket.id && (
                <div className="border-t border-stone/10 px-5 py-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-1.5">{t("yourMessage")}</p>
                    <p className="text-sm text-[#1f1b16] leading-relaxed bg-sand/40 rounded-xl px-4 py-3">{ticket.subject}</p>
                  </div>
                  {ticket.admin_reply ? (
                    <div>
                      <p className="text-[10px] font-semibold text-stone uppercase tracking-wider mb-1.5">{t("supportReply")}</p>
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <p className="text-sm text-[#1f1b16] leading-relaxed whitespace-pre-wrap">{ticket.admin_reply}</p>
                        {ticket.replied_at && (
                          <p className="text-[10px] text-stone mt-2">{timeAgo(ticket.replied_at)}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-stone italic">{t("pendingReply")}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
