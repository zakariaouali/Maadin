"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { getImageUrl, normalizeImageFile } from "@/lib/image";
import { Alert, Button, Input, PageHeader, Spinner } from "@/components/ui";

const MAX_PORTFOLIO = 4;

interface Store {
  id: number;
  store_name: string;
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
  store_slug: string;
}

export default function SellerStorePage() {
  const t = useTranslations("seller");
  const tCommon = useTranslations("common");

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [sellerBio, setSellerBio] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [shopPhotoFile, setShopPhotoFile] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [shopPhotoPreview, setShopPhotoPreview] = useState<string | null>(null);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const shopPhotoRef = useRef<HTMLInputElement>(null);
  const portfolioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/seller/store")
      .then((r) => {
        const s: Store = r.data;
        setStore(s);
        setStoreName(s.store_name);
        setStoreDesc(s.store_description ?? "");
        setSellerBio(s.seller_bio ?? "");
        setPhone(s.phone_number);
        setBankAccount(s.bank_account_number ?? "");
        setBankName(s.bank_name ?? "");
      })
      .catch((e) => {
        if (e.response?.status !== 404) setError(e.response?.data?.message || t("failedLoadData"));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.append("store_name", storeName);
    fd.append("store_description", storeDesc);
    fd.append("seller_bio", sellerBio);
    fd.append("phone_number", phone);
    fd.append("bank_account_number", bankAccount);
    fd.append("bank_name", bankName);
    if (logoFile) fd.append("logo", normalizeImageFile(logoFile));
    if (bannerFile) fd.append("banner", normalizeImageFile(bannerFile));
    if (shopPhotoFile) fd.append("shop_photo", normalizeImageFile(shopPhotoFile));
    portfolioFiles.forEach((f) => fd.append("portfolio[]", normalizeImageFile(f)));

    try {
      let res;
      if (store) {
        fd.append("_method", "PUT");
        res = await api.post("/seller/store", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setSuccess(t("storeUpdated"));
      } else {
        res = await api.post("/seller/store", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setSuccess(t("storeCreated"));
      }
      setStore(res.data);
      setLogoFile(null); setBannerFile(null); setShopPhotoFile(null); setPortfolioFiles([]);
      setLogoPreview(null); setBannerPreview(null); setShopPhotoPreview(null); setPortfolioPreviews([]);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(" ") : err.response?.data?.message || t("failedSave"));
    }
    setSaving(false);
  };

  const pickImage = (
    ref: React.RefObject<HTMLInputElement | null>,
    setFile: (f: File) => void,
    setPreview: (p: string) => void
  ) => {
    const handler = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setFile(file);
      setPreview(URL.createObjectURL(file));
    };
    const el = ref.current!;
    el.value = "";
    el.onchange = handler;
    el.click();
  };

  const addPortfolioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    const combined = [...portfolioFiles, ...incoming].slice(0, MAX_PORTFOLIO);
    setPortfolioFiles(combined);
    setPortfolioPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removePortfolio = (i: number) => {
    setPortfolioFiles((prev) => prev.filter((_, j) => j !== i));
    setPortfolioPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const existingPortfolio = store?.portfolio_paths ?? [];
  const totalPortfolio = existingPortfolio.length + portfolioFiles.length;

  return (
    <div className="max-w-2xl">
      <PageHeader title={store ? t("myStore") : t("createStore")} />

      {store?.status === "pending" && (
        <Alert type="warning" className="mb-6">{t("notVerified")}</Alert>
      )}
      {success && <Alert type="success" className="mb-6">{success}</Alert>}
      {error && <Alert type="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Banner */}
        <div className="bg-white border border-stone/20 rounded-sm overflow-hidden">
          <div className="relative h-36 bg-sand-dark cursor-pointer group" onClick={() => pickImage(bannerRef, setBannerFile, setBannerPreview)}>
            {(bannerPreview || getImageUrl(store?.banner_path)) ? (
              <Image src={bannerPreview ?? getImageUrl(store?.banner_path)!} alt="Banner" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-stone/50 gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-xs">{t("banner")}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-sm">{tCommon("edit")}</span>
            </div>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" />
          <p className="text-[11px] text-stone px-4 py-2">{t("bannerHint")}</p>
        </div>

        {/* Core info */}
        <div className="bg-white border border-stone/20 rounded-sm p-6 flex flex-col gap-5">
          {/* Logo */}
          <div>
            <p className="text-sm text-stone mb-2">{t("logo")}</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-sm bg-sand-dark overflow-hidden cursor-pointer group shrink-0"
                onClick={() => pickImage(logoRef, setLogoFile, setLogoPreview)}>
                {(logoPreview || getImageUrl(store?.logo_path)) ? (
                  <Image src={logoPreview ?? getImageUrl(store?.logo_path)!} alt="Logo" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone/40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px]">{tCommon("edit")}</span>
                </div>
              </div>
              <p className="text-[11px] text-stone leading-relaxed">{t("logoHint")}</p>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" />
          </div>

          <Input label={t("storeName")} id="store_name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />

          <div className="flex flex-col gap-1">
            <label htmlFor="store_desc" className="text-sm text-stone">{t("storeDescription")}</label>
            <textarea id="store_desc" value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} rows={3}
              className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none" />
          </div>

          <Input label={t("phoneNumber")} id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        {/* Banking */}
        <div className="bg-white border border-stone/20 rounded-sm p-6 flex flex-col gap-4">
          <h3 className="font-display text-base text-ink">{t("banking")} <span className="text-stone text-sm font-sans">({t("optional")})</span></h3>
          <Input label={t("bankName")} id="bank_name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          <Input label={t("bankAccount")} id="bank_account" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
        </div>

        {/* ── Verification proof section ── */}
        <div className="bg-white border-2 border-[#c9a227]/40 rounded-sm p-6 flex flex-col gap-6">
          <div>
            <h3 className="font-display text-base text-ink flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {t("verificationSection")}
            </h3>
            <p className="text-xs text-stone mt-1 leading-relaxed">{t("verificationHint")}</p>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-stone font-medium">{t("sellerBio")}</label>
            <textarea
              value={sellerBio}
              onChange={(e) => setSellerBio(e.target.value)}
              rows={4}
              placeholder={t("sellerBioPlaceholder")}
              className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep resize-none"
            />
          </div>

          {/* Shop photo */}
          <div>
            <p className="text-sm text-stone font-medium mb-1">{t("shopPhoto")}</p>
            <p className="text-xs text-stone/70 mb-3">{t("shopPhotoHint")}</p>
            <div
              className="relative w-full h-44 rounded-sm overflow-hidden border-2 border-dashed border-stone/30 cursor-pointer group hover:border-gold transition-colors"
              onClick={() => pickImage(shopPhotoRef, setShopPhotoFile, setShopPhotoPreview)}
            >
              {(shopPhotoPreview || getImageUrl(store?.shop_photo_path)) ? (
                <>
                  <Image src={shopPhotoPreview ?? getImageUrl(store?.shop_photo_path)!} alt="Shop" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-sm">{t("changePhoto")}</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone/40 gap-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-xs">{t("clickToUpload")}</span>
                </div>
              )}
            </div>
            <input ref={shopPhotoRef} type="file" accept="image/*" className="hidden" />
          </div>

          {/* Portfolio */}
          <div>
            <p className="text-sm text-stone font-medium mb-1">{t("portfolioImages")}</p>
            <p className="text-xs text-stone/70 mb-3">{t("portfolioHint")}</p>

            <div className="grid grid-cols-4 gap-3">
              {/* Existing (saved) portfolio images */}
              {existingPortfolio.map((path, i) => {
                const url = getImageUrl(path);
                return url ? (
                  <div key={`saved-${i}`} className="relative aspect-square rounded-sm overflow-hidden border border-stone/20">
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                ) : null;
              })}

              {/* New (unsaved) previews */}
              {portfolioPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-sm overflow-hidden border border-[#c9a227]/50">
                  <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                  <button
                    type="button"
                    onClick={() => removePortfolio(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-henna text-white flex items-center justify-center text-[11px] leading-none"
                  >×</button>
                </div>
              ))}

              {/* Add slot */}
              {totalPortfolio < MAX_PORTFOLIO && (
                <div
                  className="aspect-square rounded-sm border-2 border-dashed border-stone/30 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors text-stone/40 gap-1"
                  onClick={() => portfolioRef.current?.click()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span className="text-[10px]">{t("clickToUpload")}</span>
                </div>
              )}
            </div>
            <input ref={portfolioRef} type="file" accept="image/*" multiple className="hidden" onChange={addPortfolioFiles} />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={saving}>
          {t("saveStore")}
        </Button>
      </form>
    </div>
  );
}
