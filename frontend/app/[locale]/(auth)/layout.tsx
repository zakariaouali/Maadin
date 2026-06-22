import Image from "next/image";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Marrakech Maadine" width={120} height={73} />
        </Link>
        <div className="bg-white border border-stone/20 rounded-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}