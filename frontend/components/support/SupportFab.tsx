"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";

export default function SupportFab() {
  const pathname = usePathname();

  // Hide on the support pages themselves to avoid redundancy
  if (pathname.startsWith("/support") || pathname.startsWith("/admin/support")) return null;

  return (
    <Link
      href="/support"
      aria-label="Support"
      className="fixed bottom-6 end-6 z-40 group flex items-center gap-2.5 bg-[#1f1b16] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
      style={{ paddingLeft: "0.875rem", paddingRight: "0.875rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
    >
      {/* Icon */}
      <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {/* Label — expands on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 text-sm font-semibold whitespace-nowrap">
        Support
      </span>
    </Link>
  );
}
