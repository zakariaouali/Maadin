"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Alert, Badge, Button, PageHeader, Spinner } from "@/components/ui";

interface ManagedSeller {
  id: number;
  name: string;
  email: string;
  plan: string;
  subscription_expires_at: string | null;
  monthly_fee: string | null;
  seller?: { store_name: string; status: string } | null;
}

interface UpgradeRequest {
  id: number;
  from_plan: string;
  to_plan: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user: { id: number; name: string; email: string; plan: string };
}

type Tab = "subscriptions" | "upgrades";

const PLAN_BADGE: Record<string, string> = {
  managed: "bg-amber-100 text-amber-700",
  premium: "bg-purple-100 text-purple-700",
};

function daysLeft(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<Tab>("subscriptions");
  const [sellers, setSellers] = useState<ManagedSeller[]>([]);
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        api.get("/admin/managed-sellers"),
        api.get("/admin/upgrade-requests"),
      ]);
      setSellers(sRes.data);
      setRequests(rRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (userId: number) => {
    setActing(userId);
    setError("");
    setSuccess("");
    try {
      await api.post(`/admin/managed-sellers/${userId}/mark-paid`);
      setSuccess("Payment marked — subscription renewed for 1 month.");
      load();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Failed.");
    }
    setActing(null);
  };

  const handleUpgrade = async (requestId: number, action: "approve" | "reject", notes = "") => {
    setActing(requestId);
    setError("");
    setSuccess("");
    try {
      await api.put(`/admin/upgrade-requests/${requestId}/${action}`, { notes });
      setSuccess(`Request ${action}d successfully.`);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Failed.");
    }
    setActing(null);
  };

  const tabCls = (t: Tab) =>
    "px-4 py-2 text-sm font-medium rounded-sm transition-colors " +
    (tab === t ? "bg-white text-ink shadow-sm" : "text-stone hover:text-ink");

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader title="Subscriptions & Upgrades" />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Tabs */}
      <div className="flex gap-1 bg-sand rounded-sm p-1 w-fit">
        <button className={tabCls("subscriptions")} onClick={() => setTab("subscriptions")}>
          Subscriptions
        </button>
        <button className={tabCls("upgrades")} onClick={() => setTab("upgrades")}>
          Upgrade Requests
          {requests.length > 0 && (
            <span className="ms-2 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tab === "subscriptions" ? (
        <div className="bg-white border border-stone/20 rounded-sm divide-y divide-stone/10">
          {sellers.length === 0 ? (
            <p className="text-center text-stone py-12 text-sm">No managed sellers yet.</p>
          ) : sellers.map((s) => {
            const days = daysLeft(s.subscription_expires_at);
            const expired = days !== null && days < 0;
            const expiringSoon = days !== null && days >= 0 && days <= 10;
            const showMarkPaid = days !== null && days <= 10;
            const isSuspended = s.seller?.status === "suspended_subscription";

            return (
              <div key={s.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-sand-dark flex items-center justify-center text-stone font-semibold text-sm shrink-0 mt-0.5">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{s.name}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[s.plan] ?? "bg-stone/10 text-stone"}`}>
                        {s.plan}
                      </span>
                      {isSuspended && <Badge variant="danger">Suspended</Badge>}
                    </div>
                    <p className="text-xs text-stone truncate">{s.email}</p>
                    {s.seller && <p className="text-xs text-stone/60">{s.seller.store_name}</p>}
                  </div>
                </div>

                <div className="mt-3 ms-12 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <span className="text-stone">
                    Fee: <strong className="text-ink">{s.monthly_fee ? `${parseFloat(s.monthly_fee).toFixed(2)} MAD/mo` : "—"}</strong>
                  </span>
                  <span className={expired ? "text-red-600 font-medium" : expiringSoon ? "text-amber-600 font-medium" : "text-stone"}>
                    Expires: <strong>{s.subscription_expires_at ? new Date(s.subscription_expires_at).toLocaleDateString() : "—"}</strong>
                    {days !== null && (
                      <span className="ms-1">
                        ({expired ? `${Math.abs(days)}d overdue` : `${days}d left`})
                      </span>
                    )}
                  </span>
                </div>

                {showMarkPaid && (
                  <div className="mt-3 ms-12">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={acting === s.id}
                      onClick={() => markPaid(s.id)}
                    >
                      ✓ Mark as Paid (+1 month)
                    </Button>
                    {expired && (
                      <p className="text-xs text-red-600 mt-1">Store is suspended — marking paid will reactivate it.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone/20 rounded-sm divide-y divide-stone/10">
          {requests.length === 0 ? (
            <p className="text-center text-stone py-12 text-sm">No pending upgrade requests.</p>
          ) : requests.map((req) => (
            <div key={req.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-sand-dark flex items-center justify-center text-stone font-semibold text-sm shrink-0 mt-0.5">
                  {req.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{req.user.name}</p>
                  <p className="text-xs text-stone">{req.user.email}</p>
                  <p className="text-xs text-stone mt-1">
                    Wants to upgrade:{" "}
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${PLAN_BADGE[req.from_plan] ?? "bg-stone/10 text-stone"}`}>{req.from_plan}</span>
                    {" → "}
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${PLAN_BADGE[req.to_plan] ?? "bg-stone/10 text-stone"}`}>{req.to_plan}</span>
                  </p>
                  <p className="text-[10px] text-stone/60 mt-0.5">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-3 ms-12 flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  loading={acting === req.id}
                  onClick={() => handleUpgrade(req.id, "approve")}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={acting === req.id}
                  onClick={() => handleUpgrade(req.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
