import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
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
    </NextIntlClientProvider>
  );
}