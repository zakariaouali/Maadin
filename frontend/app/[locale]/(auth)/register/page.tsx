"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, phone, role });
      router.push("/");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0] : null;
      setError(
        (Array.isArray(firstError) ? firstError[0] : firstError) ||
          err.response?.data?.message ||
          t("registerFailed")
      );
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink text-center mb-6">
        {t("registerTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm text-stone mb-1">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm focus:border-gold-deep outline-none"
          />
        </div>

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
          <label htmlFor="phone" className="block text-sm text-stone mb-1">
            {t("phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06XXXXXXXX"
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
            minLength={8}
            className="w-full border border-stone/30 rounded-sm px-3 py-2 text-sm focus:border-gold-deep outline-none"
          />
        </div>

        <fieldset>
          <legend className="block text-sm text-stone mb-2">{t("accountType")}</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
              />
              {t("roleCustomer")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
              />
              {t("roleSeller")}
            </label>
          </div>
        </fieldset>

        {error && <p className="text-henna text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gold hover:bg-gold-deep text-ink font-medium py-2.5 rounded-sm transition-colors disabled:opacity-50"
        >
          {loading ? t("creatingAccount") : t("registerButton")}
        </button>
      </form>

      <p className="text-center text-sm text-stone mt-6">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-gold-deep hover:underline">
          {t("loginTitle")}
        </Link>
      </p>
    </div>
  );
}