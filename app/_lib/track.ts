"use client";

// Client-side analytics. Everything goes to /api/track (the private /stats
// dashboard) and is mirrored to GA4 + Clarity so those keep working.
//
//   trackOpen(item)    – visitor opened something (lightbox, project page, gallery)
//   trackView(item)    – item sat in view for a while (see useDwell); batched
//   trackContact(id)   – contact link clicked on a given page
//   trackMissing(path) – a page that doesn't exist (app/not-found.tsx)
//
// PDFs and other sites opened from any link count as opens too (see
// trackLink below), and the landing pageview carries the link's ?ref= tag.
//
// Item ids are stable strings like "quebec-night/01_home.jpg" or
// "frc-reefscape"; section + id is the key the dashboard ranks by.
//
// Devices marked as Aidan's (see uncounted.ts) send nothing.

import { useSyncExternalStore } from "react";
import { sectionFor, type SectionId } from "@/content/site";
import { isUncounted } from "./uncounted";

export interface TrackItem {
  section: SectionId;
  id: string;
  title: string;
  thumb?: string;
  href?: string;
}

type Event =
  | { t: "pv"; path: string; ref?: string; tag?: string }
  | ({ t: "open" | "view" } & TrackItem)
  | { t: "contact"; section: SectionId }
  | { t: "404"; path: string };

const ENDPOINT = "/api/track";
let queue: Event[] = [];
let firstPageview = true;

function send(events: Event[]) {
  if (!events.length || isUncounted()) return;
  const body = JSON.stringify({ events });
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
}

function flush() {
  send(queue);
  queue = [];
}

/**
 * PDFs (résumé, portfolio, paper) and other sites (LinkedIn, GitHub, YouTube)
 * opened from a link count as opens, keyed by file path or host + path.
 * mailto: links are trackContact's. GA's enhanced measurement records the same
 * clicks itself (file_download, click), so they aren't mirrored there.
 */
function trackLink(e: MouseEvent) {
  const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!(a instanceof HTMLAnchorElement) || location.pathname.startsWith("/stats")) return;
  const url = new URL(a.href, location.href);
  const local = url.origin === location.origin;
  const file = local && /\.pdf$/i.test(url.pathname);
  if (!/^https?:$/.test(url.protocol) || (local && !file)) return;
  const id = (file ? url.pathname.slice(1) : url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, ""))
    .replace(/[^\w\-./ ()]/g, "-")
    .slice(0, 120);
  const text = a.textContent?.replace(/\s+/g, " ").trim() || id;
  send([{ t: "open", section: sectionFor(location.pathname).id, id, title: file ? text : `${text} ↗`, href: file ? url.pathname : undefined }]);
}

if (typeof window !== "undefined") {
  addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  addEventListener("pagehide", flush);
  addEventListener("click", trackLink, true);
  addEventListener("auxclick", (e) => e.button === 1 && trackLink(e), true); // middle-click: new tab
}

const noop = () => () => {};

/**
 * Whether third-party analytics (GA, Clarity) should load here: false while
 * rendering on the server, on /stats, and on devices marked as Aidan's.
 */
export function useCounted(pathname: string) {
  const counted = useSyncExternalStore(noop, () => !isUncounted(), () => false);
  return counted && !pathname.startsWith("/stats");
}

function gtagEvent(name: string, params: Record<string, string>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; clarity?: (...a: unknown[]) => void };
  w.gtag?.("event", name, params);
  w.clarity?.("event", `${name}_${params.section ?? ""}`);
}

/**
 * The tag on a shared link (aidanschreder.com/engineering?ref=resume, or a
 * utm_source), so /stats can tell which résumé, profile or message a visit
 * came from. PDFs, apps and email clients rarely send a referrer.
 */
function linkTag() {
  const q = new URLSearchParams(location.search);
  return q.get("ref") ?? q.get("utm_source") ?? "";
}

export function trackPageview(path: string) {
  // Only the landing pageview carries an external referrer or tag; later
  // client-side navigations are internal by definition.
  const ref = firstPageview ? document.referrer : "";
  const tag = firstPageview ? linkTag() : "";
  firstPageview = false;
  send([{ t: "pv", path, ref, tag }]);
}

export function trackOpen(item: TrackItem) {
  send([{ t: "open", ...item }]);
  gtagEvent("item_open", { section: item.section, item_id: item.id, item_title: item.title });
}

export function trackView(item: TrackItem) {
  queue.push({ t: "view", ...item });
  if (queue.length >= 25) flush();
}

export function trackContact(section: SectionId) {
  send([{ t: "contact", section }]);
  gtagEvent("contact_click", { section });
}

export function trackMissing(path: string) {
  send([{ t: "404", path }]);
}
