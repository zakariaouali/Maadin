"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const t = useTranslations("auth");
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || t("loginFailed"));
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink text-center mb-6">
        {t("loginTitle")}
      </h1>

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

        <div>
          <label htmlFor="password" className="block text-sm text-stone mb-1">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? t("loggingIn") : t("loginButton")}
        </button>
      </form>

      <p className="text-center text-sm text-stone mt-6">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-gold-deep hover:underline">
          {t("registerTitle")}
        </Link>
      </p>
    </div>
  );
}