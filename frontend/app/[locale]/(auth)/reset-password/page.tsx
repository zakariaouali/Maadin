"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import api from "@/lib/api";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "";
      setError(msg.includes("expired") ? t("tokenExpired") : t("loginFailed"));
    }
    setLoading(false);
  };

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-henna text-sm">{t("tokenExpired")}</p>
        <Link href="/forgot-password" className="text-sm text-gold-deep hover:underline">
          {t("sendResetLink")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-sm text-stone">{t("passwordResetSuccess")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink text-center mb-6">
        {t("resetPasswordTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="block text-sm text-stone mb-1">
            {t("newPasswordLabel")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm focus:border-gold-deep outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm text-stone mb-1">
            {t("confirmNewPassword")}
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm focus:border-gold-deep outline-none"
          />
        </div>

        {error && <p className="text-henna text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gold hover:bg-gold-deep text-ink font-medium py-2.5 rounded-sm transition-colors disabled:opacity-50"
        >
          {loading ? t("resettingPassword") : t("resetPassword")}
        </button>
      </form>

      <p className="text-center text-sm text-stone mt-6">
        <Link href="/login" className="text-gold-deep hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
