"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface SuggestProduct {
  id: number; name: string; slug: string; price: string;
  primary_image?: { image_path: string } | null;
  seller?: { store_name: string; store_slug: string } | null;
}
interface SuggestStore {
  id: number; store_name: string; store_slug: string; logo_path: string | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ onClose }: { onClose?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SuggestProduct[]>([]);
  const [stores, setStores] = useState<SuggestStore[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 280);

  const placeholder = locale === "ar" ? "ابحث عن منتجات، متاجر..." : locale === "fr" ? "Chercher des produits, boutiques..." : "Search products, stores...";

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setProducts([]); setStores([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/search/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setStores(data.stores ?? []);
      setOpen((data.products?.length ?? 0) + (data.stores?.length ?? 0) > 0);
    } catch {
      setProducts([]); setStores([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuggestions(debouncedQuery); }, [debouncedQuery, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    onClose?.();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const goTo = (href: string) => {
    setOpen(false); setQuery("");
    onClose?.();
    router.push(href as any);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={submit} className="flex items-center">
        <div className="relative flex-1">
          {/* Search icon */}
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (products.length || stores.length) setOpen(true); }}
            placeholder={placeholder}
            className="w-full ps-9 pe-10 py-2 rounded-xl border border-stone/20 bg-sand/60 text-sm text-ink placeholder:text-stone/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}
          {query && !loading && (
            <button type="button" onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (
        <div ref={dropdownRef} className="absolute top-full mt-2 start-0 end-0 bg-white rounded-xl border border-stone/15 shadow-xl z-50 overflow-hidden">

          {/* Products */}
          {products.length > 0 && (
            <div>
              <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone font-semibold border-b border-stone/10">
                {locale === "ar" ? "منتجات" : locale === "fr" ? "Produits" : "Products"}
              </p>
              {products.map(p => {
                const img = getImageUrl(p.primary_image?.image_path);
                return (
                  <button key={p.id} onClick={() => goTo(`/products/${p.slug}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sand/60 transition-colors text-start">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-sand border border-stone/10 shrink-0 flex items-center justify-center">
                      {img ? <Image src={img} alt={p.name} width={40} height={40} className="object-cover w-full h-full" /> : <span className="text-stone/30 text-lg">◈</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <p className="text-xs text-stone">{p.seller?.store_name}</p>
                    </div>
                    <span className="text-sm font-bold text-gold-deep shrink-0">{Number(p.price).toLocaleString()} MAD</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Stores */}
          {stores.length > 0 && (
            <div className={products.length > 0 ? "border-t border-stone/10" : ""}>
              <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone font-semibold border-b border-stone/10">
                {locale === "ar" ? "متاجر" : locale === "fr" ? "Boutiques" : "Stores"}
              </p>
              {stores.map(s => {
                const logo = getImageUrl(s.logo_path);
                return (
                  <button key={s.id} onClick={() => goTo(`/stores/${s.store_slug}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sand/60 transition-colors text-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gold/10 border border-gold/20 shrink-0 flex items-center justify-center">
                      {logo ? <Image src={logo} alt={s.store_name} width={32} height={32} className="object-cover w-full h-full" /> : <span className="text-xs font-bold text-gold-deep">{s.store_name.charAt(0)}</span>}
                    </div>
                    <p className="text-sm font-medium text-ink truncate">{s.store_name}</p>
                    <svg className="ms-auto text-stone shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* View all */}
          {query.trim().length >= 2 && (
            <button onClick={submit}
              className="w-full px-3 py-2.5 border-t border-stone/10 text-sm text-gold-deep hover:bg-gold/5 transition-colors text-start font-medium flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {locale === "ar" ? `عرض جميع نتائج "${query}"` : locale === "fr" ? `Voir tous les résultats pour "${query}"` : `See all results for "${query}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
