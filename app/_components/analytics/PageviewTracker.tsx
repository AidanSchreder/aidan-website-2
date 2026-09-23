"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/app/_lib/track";

export function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/stats")) return;
    trackPageview(pathname);
  }, [pathname]);
  return null;
}
