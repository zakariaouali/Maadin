import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-ink text-white mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl text-white mb-2">Marrakech Maadine</p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4 font-medium">
              Explore
            </p>
            <div className="flex flex-col gap-2.5">
              <Link href="/products" className="text-sm text-white/60 hover:text-gold transition-colors">
                {t("products")}
              </Link>
              <Link href="/login" className="text-sm text-white/60 hover:text-gold transition-colors">
                {t("login")}
              </Link>
              <Link href="/register" className="text-sm text-white/60 hover:text-gold transition-colors">
                Sell on Maadine
              </Link>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4 font-medium">
              Marrakech, Morocco
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              Connecting buyers worldwide with the finest Moroccan artisans since 2024.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/30">
          <p>&copy; {new Date().getFullYear()} Marrakech Maadine. All rights reserved.</p>
          <div className="zellige-divider w-24 opacity-30" />
        </div>
      </div>
    </footer>
  );
}
