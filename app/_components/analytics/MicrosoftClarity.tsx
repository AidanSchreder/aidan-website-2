"use client";

// Clarity: heatmaps and session replays. No consent banner required.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { sectionFor } from "@/content/site";

const CLARITY_PROJECT_ID = "vv6k3s8thp";

export function MicrosoftClarity() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as unknown as { clarity?: (...a: unknown[]) => void };
    w.clarity?.("set", "page_path", pathname);
    w.clarity?.("set", "section", sectionFor(pathname).id);
  }, [pathname]);

  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}
