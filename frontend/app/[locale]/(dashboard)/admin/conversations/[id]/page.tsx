"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const r = useRouter();
  useEffect(() => {
    r.replace("/admin/conversations");
  }, [r]);
  return null;
}
