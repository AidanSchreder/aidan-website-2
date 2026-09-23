// ── MICROSOFT CLARITY ────────────────────────────────────────────────────────
// Place this file at: app/components/MicrosoftClarity.tsx
//
// USAGE IN LAYOUT:
//   Add <MicrosoftClarity /> inside <body> in app/layout.tsx:
//
//   import MicrosoftClarity from "./components/MicrosoftClarity";
//   ...
//   <body>
//     <MicrosoftClarity />
//     <GoogleAnalytics />
//     <StructuredData />
//     {children}
//   </body>
//
// NO COOKIE BANNER REQUIRED:
//   Clarity does not drop tracking cookies that require consent under most
//   interpretations of GDPR/CCPA — it uses session-based identifiers rather
//   than persistent cross-site tracking cookies. You do not need to gate
//   Clarity behind your cookie consent banner.
//
// WHAT YOU GET IN THE CLARITY DASHBOARD:
//   - Heatmaps: see exactly where visitors click and how far they scroll
//   - Session replays: watch real visit recordings
//   - Dead clicks / rage clicks: spots where your UI might be confusing
//   - Scroll depth per page automatically — no custom events needed
//
// No custom event API is needed for Clarity — the heatmaps and replays
// answer the "what did they click / how far did they scroll" questions visually.

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const CLARITY_PROJECT_ID = "vv6k3s8thp";

type ClarityTagValue = string | string[];
type ClarityCommand = (...args: unknown[]) => void;
type QueuedClarityCommand = ClarityCommand & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: QueuedClarityCommand;
  }
}

const clarityTagState = new Map<string, Set<string>>();

function getClarity() {
  if (typeof window === "undefined") return null;

  if (typeof window.clarity === "function") {
    return window.clarity;
  }

  const clarityQueue: QueuedClarityCommand = (...args: unknown[]) => {
    clarityQueue.q = clarityQueue.q || [];
    clarityQueue.q.push(args);
  };

  clarityQueue.q = clarityQueue.q || [];
  window.clarity = clarityQueue;
  return window.clarity;
}

function getPageType(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/portfolio") return "portfolio";
  if (pathname === "/thank-you") return "thank_you";
  return "other";
}

export function setClarityTag(key: string, value: ClarityTagValue) {
  const clarity = getClarity();
  if (!clarity) return;
  clarity("set", key, value);
}

export function appendClarityTag(key: string, value: string | string[]) {
  const values = Array.isArray(value) ? value : [value];
  const existing = clarityTagState.get(key) ?? new Set<string>();

  values
    .filter(Boolean)
    .forEach((entry) => {
      existing.add(entry);
    });

  clarityTagState.set(key, existing);
  setClarityTag(key, Array.from(existing));
}

export function trackClarityEvent(eventName: string) {
  const clarity = getClarity();
  if (!clarity) return;
  clarity("event", eventName);
}

export default function MicrosoftClarity() {
  const pathname = usePathname();

  useEffect(() => {
    setClarityTag("page_path", pathname);
    setClarityTag("page_type", getPageType(pathname));
  }, [pathname]);

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
