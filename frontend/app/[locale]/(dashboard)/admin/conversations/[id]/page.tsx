"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

// Alerts link to /admin/conversations/ID: show the list with that thread already open
export default function Page() {
  const r = useRouter();
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    r.replace(`/admin/conversations?open=${encodeURIComponent(id)}`);
  }, [r, id]);
  return null;
}
