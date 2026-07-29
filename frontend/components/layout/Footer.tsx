import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-ink text-white mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-display text-2xl text-white mb-2">Marrakech Maadine</p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <p className="text-xs text-white/25 mt-4 leading-relaxed">
              Médina, Marrakech, Maroc
            </p>
          </div>

          {/* Explore */}
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
              <Link href="/plans" className="text-sm text-white/60 hover:text-gold transition-colors">
                Sell on Maadine
              </Link>
              <Link href="/support" className="text-sm text-white/60 hover:text-gold transition-colors">
                {t("support")}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4 font-medium">
              {t("legal")}
            </p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-sm text-white/60 hover:text-gold transition-colors">
                {t("privacy")}
              </Link>
              <Link href="/terms" className="text-sm text-white/60 hover:text-gold transition-colors">
                {t("terms")}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4 font-medium">
              Contact
            </p>
            <div className="flex flex-col gap-2.5">
              <a href="mailto:maadinemarrakech@gmail.com" className="text-sm text-white/60 hover:text-gold transition-colors">
                maadinemarrakech@gmail.com
              </a>
              <a href="tel:+212661686140" className="text-sm text-white/60 hover:text-gold transition-colors" dir="ltr">
                +212 661-686140
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/30">
          <p>&copy; {new Date().getFullYear()} Marrakech Maadine. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">{t("privacy")}</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white/60 transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
