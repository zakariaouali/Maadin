import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportFab from "@/components/support/SupportFab";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <SupportFab />
    </>
  );
}