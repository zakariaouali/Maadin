"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError(t("emailNotFound"));
      } else {
        setError(t("loginFailed"));
      }
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 className="font-display text-xl text-ink">{t("sendResetLink")}</h2>
        <p className="text-sm text-stone leading-relaxed">{t("resetLinkSent")}</p>
        <Link href="/login" className="inline-block mt-2 text-sm text-gold-deep hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink text-center mb-2">
        {t("forgotPasswordTitle")}
      </h1>
      <p className="text-sm text-stone text-center mb-6">{t("forgotPasswordDesc")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm text-stone mb-1">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? t("sendingResetLink") : t("sendResetLink")}
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
