// ── GOOGLE ANALYTICS 4 ───────────────────────────────────────────────────────
// Place this file at: app/components/GoogleAnalytics.tsx
//
// USAGE IN LAYOUT:
//   Add <GoogleAnalytics /> inside <body> in app/layout.tsx:
//
//   import GoogleAnalytics from "./components/GoogleAnalytics";
//   ...
//   <body>
//     <GoogleAnalytics />
//     <StructuredData />
//     {children}
//   </body>
//
// COOKIE CONSENT:
//   GA4 uses cookies and fingerprinting, which requires a consent banner
//   under GDPR (EU) and similar laws. See CookieConsent.tsx for a ready-made
//   minimal banner. If you later want to remove GA4 and the consent requirement
//   entirely, see the "REMOVING GA4" note at the bottom of this file.
//
// TRACKING CUSTOM EVENTS:
//   Import `trackGA4Event` anywhere in your client components:
//
//   import { trackGA4Event } from "./components/GoogleAnalytics";
//   trackGA4Event("contact_click", { source: "hero_cta" });
//   trackGA4Event("project_viewed", { project: "Logo Design — Acme Co" });

"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = "G-TEGYYJX901";

// ── PROVIDER COMPONENT ────────────────────────────────────────────────────────
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// ── EVENT TRACKING UTILITY ────────────────────────────────────────────────────
type GA4Props = Record<string, string | number | boolean>;

export function trackGA4Event(eventName: string, props?: GA4Props): void {
  if (typeof window === "undefined") return;

  const gtag = (window as Window & {
    gtag?: (...args: unknown[]) => void;
  }).gtag;

  if (typeof gtag === "function") {
    gtag("event", eventName, props ?? {});
  }
}

// ── REMOVING GA4 ─────────────────────────────────────────────────────────────
// If you decide to remove GA4 later (e.g. to drop the cookie banner):
//
//   1. Delete this file (app/components/GoogleAnalytics.tsx)
//   2. Delete app/components/CookieConsent.tsx
//   3. Remove <GoogleAnalytics /> from app/layout.tsx
//   4. Remove <CookieConsent /> from app/layout.tsx
//   5. Remove all `trackGA4Event(...)` calls from your client components
//      — search the project for "trackGA4Event" to find them all
//   6. In your GA4 dashboard, go to Admin → Data Deletion to request
//      deletion of any collected data if desired
//
// Microsoft Clarity does not require a consent banner and can stay in place.
