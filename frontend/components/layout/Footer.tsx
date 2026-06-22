import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-stone/20 mt-auto">
      <div className="zellige-divider" />
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-stone">
        <p>{t("tagline")}</p>
        <div className="flex gap-6">
          <Link href="/products" className="hover:text-gold-deep transition-colors">
            {t("products")}
          </Link>
          <Link href="/login" className="hover:text-gold-deep transition-colors">
            {t("login")}
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Marrakech Maadine</p>
      </div>
    </footer>
  );
}