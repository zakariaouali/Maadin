"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { Alert, Badge, Button, Modal, PageHeader, Spinner } from "@/components/ui";

interface SellerUser {
  id: number; name: string; email: string; phone?: string; plan?: string; created_at?: string;
}
interface Seller {
  id: number;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  seller_bio: string | null;
  phone_number: string;
  bank_account_number: string | null;
  bank_name: string | null;
  logo_path: string | null;
  banner_path: string | null;
  shop_photo_path: string | null;
  portfolio_paths: string[] | null;
  status: string;
  created_at: string;
  user: SellerUser;
}

type Tab = "pending" | "verified" | "suspended" | "all";
const STATUS_VARIANT: Record<string, "warning" | "success" | "danger" | "default"> = {
  pending: "warning", verified: "success", suspended: "danger",
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] uppercase tracking-widest text-stone font-medium">{label}</span>
    <span className="text-sm text-ink">{value || "—"}</span>
  </div>
);

export default function AdminSellersPage() {
  const t = useTranslations("admin");

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState<Seller | null>(null);

  const load = useCallback(async (currentTab: Tab, q: string) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (currentTab !== "all") params.status = currentTab;
    if (q) params.search = q;
    try {
      const { data } = await api.get("/admin/sellers", { params });
      setSellers(data.data ?? data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load("pending", ""); }, [load]);

  const act = async (id: number, action: "verify" | "suspend" | "reactivate", msg: string) => {
    setActing(id); setError(""); setSuccess("");
    try {
      const method = action === "verify" || action === "suspend" ? "put" : "put";
      await api[method](`/admin/sellers/${id}/${action}`);
      setSuccess(msg);
      setReviewing(null);
      load(tab, search);
    } catch (e: any) { setError(e.response?.data?.message || "Failed."); }
    setActing(null);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: t("pending") },
    { key: "verified", label: t("verified") },
    { key: "suspended", label: t("suspended") },
    { key: "all", label: t("all") },
  ];

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader title={t("sellers")} />
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="flex gap-1 bg-sand rounded-sm p-1 w-fit">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => { setTab(tb.key); load(tb.key, search); }}
            className={`px-4 py-1.5 rounded-sm text-sm transition-colors ${tab === tb.key ? "bg-white text-ink shadow-sm font-medium" : "text-stone hover:text-ink"}`}>
            {tb.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(tab, search); }} className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchSellers")}
          className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep flex-1 max-w-xs" />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : sellers.length === 0 ? (
        <p className="text-stone text-sm py-8 text-center">{t("noSellers")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sellers.map((s) => (
            <div key={s.id} className="bg-white border border-stone/20 rounded-sm overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Logo avatar */}
                <div className="relative w-11 h-11 rounded-full shrink-0 bg-gold/15 overflow-hidden flex items-center justify-center">
                  {s.logo_path ? (
                    <Image src={getImageUrl(s.logo_path)!} alt="" fill className="object-cover" sizes="44px" />
                  ) : (
                    <span className="text-gold-deep font-semibold text-sm">{s.store_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{s.store_name}</p>
                  <p className="text-xs text-stone truncate">{s.user.name} · {s.user.email}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={STATUS_VARIANT[s.status] ?? "default"}>{s.status}</Badge>
                  <span className="text-xs text-stone hidden md:block">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {s.status === "pending" && (
                    <Button size="sm" variant="primary" onClick={() => setReviewing(s)}>{t("view")}</Button>
                  )}
                  {s.status === "verified" && (
                    <Button size="sm" variant="secondary" loading={acting === s.id} onClick={() => act(s.id, "suspend", t("sellerSuspended"))}>{t("suspend")}</Button>
                  )}
                  {s.status === "suspended" && (
                    <Button size="sm" variant="primary" loading={acting === s.id} onClick={() => act(s.id, "reactivate", t("sellerReactivated"))}>{t("activate")}</Button>
                  )}
                  {s.status !== "pending" && (
                    <Button size="sm" variant="ghost" onClick={() => setReviewing(s)}>{t("view")}</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Full profile review modal ── */}
      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={t("reviewSeller")}
        maxWidth="max-w-3xl"
        noPadding
      >
        {reviewing && <SellerReviewPanel seller={reviewing} acting={acting} onAct={act} t={t} />}
      </Modal>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-w-[92vw] max-h-[92vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function SellerReviewPanel({
  seller: s,
  acting,
  onAct,
  t,
}: {
  seller: Seller;
  acting: number | null;
  onAct: (id: number, action: "verify" | "suspend" | "reactivate", msg: string) => void;
  t: ReturnType<typeof useTranslations<"admin">>;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const bannerUrl = getImageUrl(s.banner_path);
  const logoUrl = getImageUrl(s.logo_path);
  const shopPhotoUrl = getImageUrl(s.shop_photo_path);
  const portfolio = s.portfolio_paths ?? [];

  return (
    <>
    {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    <div className="flex flex-col gap-0 overflow-hidden">

      {/* Banner + logo */}
      <div className="relative h-40 bg-[#1f1b16] shrink-0">
        {bannerUrl ? (
          <Image
            src={bannerUrl} alt="" fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover opacity-80 cursor-zoom-in"
            onClick={() => setLightbox(bannerUrl)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b1f12] to-[#1f1b16]" />
        )}
        {/* Logo */}
        <div className="absolute bottom-0 translate-y-1/2 start-6">
          <div
            className={`relative w-20 h-20 rounded-xl border-4 border-white bg-sand overflow-hidden shadow-lg ${logoUrl ? "cursor-zoom-in" : ""}`}
            onClick={() => logoUrl && setLightbox(logoUrl)}
          >
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold-deep text-2xl font-bold">
                {s.store_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        {/* Status badge */}
        <div className="absolute top-3 end-4">
          <Badge variant={STATUS_VARIANT[s.status] ?? "default"} className="capitalize">{s.status}</Badge>
        </div>
      </div>

      {/* Body */}
      <div className="pt-14 px-6 pb-6 flex flex-col gap-6">

        {/* Store name + actions row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{s.store_name}</h2>
            <p className="text-xs text-stone mt-0.5">/{s.store_slug}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {s.status === "pending" && (
              <>
                <Button variant="primary" loading={acting === s.id} onClick={() => onAct(s.id, "verify", t("sellerVerified"))}>
                  ✓ {t("verify")}
                </Button>
                <Button variant="danger" loading={acting === s.id} onClick={() => onAct(s.id, "suspend", t("sellerSuspended"))}>
                  {t("suspend")}
                </Button>
              </>
            )}
            {s.status === "verified" && (
              <Button variant="secondary" loading={acting === s.id} onClick={() => onAct(s.id, "suspend", t("sellerSuspended"))}>
                {t("suspend")}
              </Button>
            )}
            {s.status === "suspended" && (
              <Button variant="primary" loading={acting === s.id} onClick={() => onAct(s.id, "reactivate", t("sellerReactivated"))}>
                {t("activate")}
              </Button>
            )}
          </div>
        </div>

        {/* Two-column info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Owner info */}
          <div className="bg-sand/60 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-stone font-semibold">{t("ownerInfo")}</p>
            <InfoRow label={t("name")} value={s.user.name} />
            <InfoRow label={t("email")} value={s.user.email} />
            <InfoRow label={t("phone")} value={s.user.phone} />
            <InfoRow label={t("plan")} value={s.user.plan} />
            <InfoRow label={t("memberSince")} value={s.user.created_at ? new Date(s.user.created_at).toLocaleDateString() : undefined} />
          </div>

          {/* Store info */}
          <div className="bg-sand/60 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-stone font-semibold">{t("storeInfo")}</p>
            <InfoRow label={t("phone")} value={s.phone_number} />
            <InfoRow label={t("storeName")} value={s.store_name} />
            <InfoRow label={t("bankName")} value={s.bank_name} />
            <InfoRow label={t("bankAccount")} value={s.bank_account_number} />
            {s.store_description && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-widest text-stone font-medium">{t("description")}</span>
                <p className="text-sm text-ink leading-relaxed">{s.store_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Verification proof ── */}
        <div className="border-t border-stone/15 pt-6 flex flex-col gap-5">
          <p className="text-xs uppercase tracking-widest text-stone font-semibold">{t("verificationProof")}</p>

          {/* Bio */}
          <div>
            <p className="text-xs text-stone mb-2 font-medium">{t("sellerBioLabel")}</p>
            {s.seller_bio ? (
              <p className="text-sm text-ink leading-relaxed bg-sand/60 rounded-lg px-4 py-3">{s.seller_bio}</p>
            ) : (
              <p className="text-sm text-stone/50 italic">{t("noBio")}</p>
            )}
          </div>

          {/* Shop photo + portfolio side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Shop photo */}
            <div>
              <p className="text-xs text-stone mb-2 font-medium">{t("shopPhotoLabel")}</p>
              {shopPhotoUrl ? (
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden border border-stone/20 cursor-zoom-in group"
                  onClick={() => setLightbox(shopPhotoUrl)}
                >
                  <Image src={shopPhotoUrl} alt="Shop" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl border-2 border-dashed border-stone/20 flex items-center justify-center">
                  <p className="text-xs text-stone/40 italic">{t("noShopPhoto")}</p>
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div>
              <p className="text-xs text-stone mb-2 font-medium">{t("portfolioLabel")}</p>
              {portfolio.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {portfolio.map((path, i) => {
                    const url = getImageUrl(path);
                    return url ? (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border border-stone/20 cursor-zoom-in group"
                        onClick={() => setLightbox(url)}
                      >
                        <Image src={url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="150px" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl border-2 border-dashed border-stone/20 flex items-center justify-center">
                  <p className="text-xs text-stone/40 italic">{t("noPortfolio")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom action bar for pending */}
        {s.status === "pending" && (
          <div className="border-t border-stone/15 pt-4 flex gap-3">
            <Button variant="primary" className="flex-1" loading={acting === s.id} onClick={() => onAct(s.id, "verify", t("sellerVerified"))}>
              ✓ {t("verify")} — Approve this seller
            </Button>
            <Button variant="danger" loading={acting === s.id} onClick={() => onAct(s.id, "suspend", t("sellerSuspended"))}>
              {t("reject")}
            </Button>
          </div>
        )}

      </div>
    </div>
    </>
  );
}
