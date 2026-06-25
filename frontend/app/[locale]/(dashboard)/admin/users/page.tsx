"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Alert, Badge, Button, PageHeader, Spinner } from "@/components/ui";

interface User {
  id: number; name: string; email: string; phone?: string;
  role: string; status: string; created_at: string; last_login_at?: string;
}
type StatusTab = "all" | "active" | "suspended" | "banned";
type RoleFilter = "all" | "customer" | "seller";
const SV: Record<string, "success"|"warning"|"danger"|"default"> = { active:"success", suspended:"warning", banned:"danger" };

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [st, setSt] = useState<StatusTab>("all");
  const [rf, setRf] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<number|null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = async (s: StatusTab, r: RoleFilter, q: string) => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (s !== "all") p.status = s;
    if (r !== "all") p.role = r;
    if (q) p.search = q;
    try { const { data } = await api.get("/admin/users", { params: p }); setUsers(data.data ?? data); } catch {}
    setLoading(false);
  };
  useEffect(() => { load("all","all",""); }, []);

  const updateStatus = async (id: number, status: string) => {
    setActing(id); setError(""); setSuccess("");
    try {
      await api.put(`/admin/users/${id}/status`, { status });
      setSuccess(t("statusUpdated")); load(st, rf, search);
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const stTabs: {key:StatusTab;label:string}[] = [{key:"all",label:t("all")},{key:"active",label:t("active")},{key:"suspended",label:t("suspended")},{key:"banned",label:t("banned")}];
  const rfTabs: {key:RoleFilter;label:string}[] = [{key:"all",label:t("all")},{key:"customer",label:t("customer")},{key:"seller",label:t("seller")}];
  const cls = (a: boolean) => "px-3 py-1.5 rounded-sm text-sm transition-colors " + (a ? "bg-white text-ink shadow-sm font-medium" : "text-stone hover:text-ink");

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader title={t("users")} />
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-sand rounded-sm p-1">
          {stTabs.map(tb => <button key={tb.key} onClick={() => { setSt(tb.key); load(tb.key,rf,search); }} className={cls(st===tb.key)}>{tb.label}</button>)}
        </div>
        <div className="flex gap-1 bg-sand rounded-sm p-1">
          {rfTabs.map(tb => <button key={tb.key} onClick={() => { setRf(tb.key); load(st,tb.key,search); }} className={cls(rf===tb.key)}>{tb.label}</button>)}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); load(st,rf,search); }} className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchUsers")}
          className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep flex-1 max-w-xs" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>
      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      : users.length === 0 ? <p className="text-stone text-sm py-8 text-center">{t("noUsers")}</p>
      : (
        <div className="bg-white border border-stone/20 rounded-sm divide-y divide-stone/10">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-sand-dark flex items-center justify-center text-stone font-semibold text-sm shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{u.name}</p>
                <p className="text-xs text-stone truncate">{u.email}</p>
                {u.last_login_at && <p className="text-xs text-stone/60">{t("lastLogin")}: {new Date(u.last_login_at).toLocaleDateString()}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={u.role==="seller"?"gold":"default"} className="capitalize">{u.role}</Badge>
                <Badge variant={SV[u.status]??"default"}>{u.status}</Badge>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {u.status!=="active" && <Button size="sm" variant="primary" loading={acting===u.id} onClick={() => updateStatus(u.id,"active")}>{t("activate")}</Button>}
                {u.status==="active" && <Button size="sm" variant="secondary" loading={acting===u.id} onClick={() => updateStatus(u.id,"suspended")}>{t("suspend")}</Button>}
                {u.status!=="banned" && <Button size="sm" variant="danger" loading={acting===u.id} onClick={() => { if(window.confirm("Ban this user?")) updateStatus(u.id,"banned"); }}>{t("ban")}</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
