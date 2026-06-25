"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";

interface AppNotification {
  id: number;
  type: "message" | "order" | "product" | "system";
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  message: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  order: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
    </svg>
  ),
  product: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const TYPE_COLOR: Record<string, string> = {
  message: "bg-violet-100 text-violet-600",
  order:   "bg-amber-100 text-amber-600",
  product: "bg-green-100 text-green-600",
  system:  "bg-stone/10 text-stone",
};

export default function NotificationBell() {
  const locale = useLocale();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/list");
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {}
  }, []);

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unread > 0) {
      // Mark all read immediately on open
      try {
        await api.post("/notifications/read-all");
        setUnread(0);
        setNotifications(n => n.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
      } catch {}
    }
  };

  const handleClick = async (n: AppNotification) => {
    setOpen(false);
    if (n.link) router.push(n.link as any);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
        className="relative p-2 text-stone hover:text-gold-deep transition-colors rounded-sm hover:bg-sand"
        aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-henna text-white text-[9px] rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 bg-white border border-stone/15 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone/10">
            <h3 className="text-sm font-semibold text-ink">
              {locale === "ar" ? "الإشعارات" : locale === "fr" ? "Notifications" : "Notifications"}
            </h3>
            {unread === 0 && notifications.length > 0 && (
              <span className="text-[10px] text-stone">
                {locale === "ar" ? "كل شيء مقروء" : locale === "fr" ? "Tout lu" : "All caught up"}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-stone">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm">{locale === "ar" ? "لا توجد إشعارات" : locale === "fr" ? "Aucune notification" : "No notifications yet"}</p>
              </div>
            ) : notifications.map(n => (
              <button key={n.id} onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-sand/60 transition-colors text-start border-b border-stone/5 last:border-0 ${!n.read_at ? "bg-gold/5" : ""}`}>
                {/* Type icon */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${TYPE_COLOR[n.type] ?? TYPE_COLOR.system}`}>
                  {TYPE_ICON[n.type] ?? TYPE_ICON.system}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${!n.read_at ? "font-semibold text-ink" : "text-stone"}`}>{n.title}</p>
                  {n.body && <p className="text-[11px] text-stone mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-stone/60 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read_at && <div className="w-2 h-2 rounded-full bg-henna shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
