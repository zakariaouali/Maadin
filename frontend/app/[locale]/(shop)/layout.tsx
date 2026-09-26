import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportFab from "@/components/support/SupportFab";
import { getTranslations } from "next-intl/server";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  return (
    <>
      {/* First thing a keyboard user tabs to: jump past the navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm"
      >
        {t("skipToContent")}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-h-screen outline-none">{children}</main>
      <Footer />
      <SupportFab />
    </>
  );
}