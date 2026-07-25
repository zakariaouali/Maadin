"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { CategoryIcon } from "@/components/support/CategoryIcon";

interface Category {
  key: string;
  label: string;
  desc: string;
}

interface T {
  formTitle: string;
  selectCategory: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitBtn: string;
  submitting: string;
  successTitle: string;
  successDesc: string;
  newTicket: string;
  viewTickets: string;
  errorFallback: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  required: string;
}

export default function SupportForm({ categories, t }: { categories: Category[]; t: T }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true); setError("");
    try {
      await api.post("/support", { ...form, category: selected });
      setDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.message
        ?? Object.values(err.response?.data?.errors ?? {}).flat().join(" ")
        ?? t.errorFallback;
      setError(String(msg));
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
          <svg className="text-green-500" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-[#1f1b16] mb-2">{t.successTitle}</h2>
        <p className="text-stone text-sm mb-8 leading-relaxed">{t.successDesc}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => { setDone(false); setSelected(null); setForm({ guest_name: "", guest_email: "", subject: "", message: "" }); }}
            className="px-5 py-2.5 rounded-xl border border-stone/20 text-sm font-medium text-stone hover:text-[#1f1b16] transition-colors">
            {t.newTicket}
          </button>
          <button onClick={() => router.push("/support/tickets" as any)}
            className="px-5 py-2.5 rounded-xl bg-[#1f1b16] text-white text-sm font-medium hover:bg-[#2d2820] transition-colors">
            {t.viewTickets}
          </button>
        </div>
      </div>
    );
  }

  const inp = "w-full px-4 py-2.5 rounded-xl border border-stone/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-colors";
  const lbl = "block text-xs font-semibold text-stone uppercase tracking-wider mb-1.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Category picker */}
      <div className="lg:col-span-2 space-y-2">
        <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">{t.selectCategory}</p>
        {categories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelected(cat.key)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${
              selected === cat.key
                ? "bg-[#1f1b16] text-white border-[#1f1b16] shadow-lg"
                : "bg-white border-stone/15 hover:border-[#c9a96e]/40 hover:shadow-sm text-[#1f1b16]"
            }`}
          >
            <span className={`shrink-0 ${selected === cat.key ? "text-[#c9a96e]" : "text-stone"}`}>
              <CategoryIcon category={cat.key} className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{cat.label}</p>
              <p className={`text-xs truncate ${selected === cat.key ? "text-white/60" : "text-stone"}`}>{cat.desc}</p>
            </div>
            {selected === cat.key && (
              <svg className="ms-auto shrink-0 text-[#c9a96e]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-3xl border border-stone/10 shadow-sm p-6 sm:p-8">
          <h2 className="font-display text-xl text-[#1f1b16] mb-6">{t.formTitle}</h2>

          {!selected && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {t.selectCategory}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{t.nameLabel} <span className="text-red-400 normal-case">{t.required}</span></label>
                <input className={inp} placeholder={t.namePlaceholder} value={form.guest_name}
                  onChange={e => set("guest_name", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>{t.emailLabel} <span className="text-red-400 normal-case">{t.required}</span></label>
                <input type="email" className={inp} placeholder={t.emailPlaceholder} value={form.guest_email}
                  onChange={e => set("guest_email", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={lbl}>{t.subjectLabel} <span className="text-red-400 normal-case">{t.required}</span></label>
              <input className={inp} placeholder={t.subjectPlaceholder} value={form.subject}
                onChange={e => set("subject", e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>{t.messageLabel} <span className="text-red-400 normal-case">{t.required}</span></label>
              <textarea className={inp + " resize-none"} rows={5} placeholder={t.messagePlaceholder}
                value={form.message} onChange={e => set("message", e.target.value)} required minLength={10} />
            </div>
            <button type="submit" disabled={submitting || !selected}
              className="w-full py-3 rounded-xl bg-[#1f1b16] text-white font-semibold text-sm hover:bg-[#2d2820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? t.submitting : t.submitBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
