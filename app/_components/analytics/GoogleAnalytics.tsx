"use client";

// GA4, kept alongside the private /stats dashboard. Item opens and contact
// clicks are forwarded from app/_lib/track.ts as `item_open` / `contact_click`.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useCounted } from "@/app/_lib/track";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-3RYJ5FDDWX";
// The inline snippet below records the landing page view itself.
let landing = true;

export function GoogleAnalytics() {
  const pathname = usePathname();
  const counted = useCounted(pathname);

  useEffect(() => {
    if (!counted) return;
    if (landing) {
      landing = false;
      return;
    }
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
    });
  }, [pathname, counted]);

  if (process.env.NODE_ENV !== "production" || !counted) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{send_page_view:false});gtag('event','page_view',{page_path:location.pathname});`}
      </Script>
    </>
  );
}
