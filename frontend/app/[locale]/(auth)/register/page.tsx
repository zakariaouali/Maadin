"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const planMeta: Record<string, { color: string; badge: string }> = {
  starter: { color: "border-stone/30 bg-sand/50", badge: "bg-stone/10 text-stone" },
  managed: { color: "border-[#c9a227]/60 bg-[#c9a227]/5", badge: "bg-[#c9a227] text-[#1f1b16]" },
  premium: { color: "border-[#1f1b16] bg-[#1f1b16]/5", badge: "bg-[#1f1b16] text-white" },
};

function RegisterForm() {
  const t = useTranslations("auth");
  const tp = useTranslations("plans");
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = searchParams.get("role") === "seller" ? "seller" : "customer";
  const initialPlan = (searchParams.get("plan") as "starter" | "managed" | "premium") || "starter";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "seller">(initialRole);
  const [plan, setPlan] = useState<"starter" | "managed" | "premium">(initialPlan);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    const p = searchParams.get("plan");
    if (r === "seller") setRole("seller");
    if (p === "starter" || p === "managed" || p === "premium") setPlan(p);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, phone, role, plan: role === "seller" ? plan : undefined });
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

  const planNames: Record<string, string> = {
    starter: tp("starterName"),
    managed: tp("managedName"),
    premium: tp("premiumName"),
  };

  const meta = planMeta[plan] ?? planMeta.starter;

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

        {/* Plan selector — shown only for sellers */}
        {role === "seller" && (
          <div className={`rounded-lg border p-4 ${meta.color} transition-all duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink">{tp("sellWithUs")}</span>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                {planNames[plan]}
              </span>
            </div>
            <div className="flex gap-2">
              {(["starter", "managed", "premium"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all duration-150 ${
                    plan === p
                      ? "bg-[#c9a227] border-[#c9a227] text-[#1f1b16]"
                      : "bg-white border-stone/30 text-stone hover:border-gold-deep"
                  }`}
                >
                  {planNames[p]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone mt-2 leading-relaxed">
              {plan === "starter" && tp("starterDesc")}
              {plan === "managed" && tp("managedDesc")}
              {plan === "premium" && tp("premiumDesc")}
            </p>
            <Link href="/plans" className="text-[11px] text-gold-deep hover:underline mt-1 inline-block">
              {tp("upgradeCta")} →
            </Link>
          </div>
        )}

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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
