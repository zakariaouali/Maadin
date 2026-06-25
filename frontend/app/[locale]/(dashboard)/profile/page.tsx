"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { getImageUrl, normalizeImageFile } from "@/lib/image";
import { Alert, Button, PageHeader, Spinner } from "@/components/ui";

export default function ProfilePage() {
  const t = useTranslations("admin");
  const { user, refetchUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const avatarUrl = preview ?? (user?.avatar_path ? getImageUrl(user.avatar_path) : null);
  const initials = (user?.name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(normalizeImageFile(file));
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("phone", phone);
      if (avatarFile) fd.append("avatar", avatarFile);
      await api.post("/me/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refetchUser();
      setAvatarFile(null);
      setPreview(null);
      setSuccess(t("profileSaved"));
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors ? Object.values(data.errors).flat().join(" ") : data?.message || t("save"));
    }
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true); setPwError(""); setPwSuccess("");
    try {
      await api.post("/me/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPwSuccess(t("passwordChanged"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      const data = err.response?.data;
      setPwError(data?.errors ? Object.values(data.errors).flat().join(" ") : data?.message || t("wrongPassword"));
    }
    setPwSaving(false);
  };

  if (!user) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-md space-y-8">
      <PageHeader title={t("profile")} />

      {/* Profile info */}
      <div className="bg-white border border-stone/20 rounded-sm p-6">
        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        {success && <Alert type="success" className="mb-4">{success}</Alert>}

        <form onSubmit={saveProfile} className="flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gold/20 flex items-center justify-center text-gold-deep text-2xl font-semibold border-2 border-white shadow">
                {avatarUrl
                  ? <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  : <span>{initials}</span>}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </button>
            <div>
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <p className="text-xs text-stone capitalize">{user.role}</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-gold-deep hover:underline mt-1">
                {t("edit")} photo
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("email")}</label>
            <input value={user.email} disabled
              className="border border-stone/20 rounded-sm px-3 py-2 text-sm bg-sand text-stone" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("phone")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel"
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
          </div>

          <Button type="submit" variant="primary" loading={saving}>{t("save")}</Button>
        </form>
      </div>

      {/* Password change */}
      <div className="bg-white border border-stone/20 rounded-sm p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">{t("changePassword")}</h2>
        {pwError && <Alert type="error" className="mb-4">{pwError}</Alert>}
        {pwSuccess && <Alert type="success" className="mb-4">{pwSuccess}</Alert>}

        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("currentPassword")}</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("newPassword")}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-stone uppercase tracking-wide">{t("confirmPassword")}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              className="border border-stone/30 rounded-sm px-3 py-2 text-sm outline-none focus:border-gold-deep" />
          </div>
          <Button type="submit" variant="secondary" loading={pwSaving}>{t("changePassword")}</Button>
        </form>
      </div>
    </div>
  );
}
