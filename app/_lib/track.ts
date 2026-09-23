"use client";

// Client-side analytics. Everything goes to /api/track (the private /stats
// dashboard) and is mirrored to GA4 + Clarity so those keep working.
//
//   trackOpen(item)  – visitor opened something (lightbox, case study, gallery)
//   trackView(item)  – item sat in view for a while (see useDwell); batched
//   trackContact(id) – contact link clicked on a given page
//
// Item ids are stable strings like "quebec-night/01_home.jpg" or
// "frc-reefscape"; section + id is the key the dashboard ranks by.

import type { SectionId } from "@/content/site";

export interface TrackItem {
  section: SectionId;
  id: string;
  title: string;
  thumb?: string;
  href?: string;
}

type Event =
  | { t: "pv"; path: string; ref?: string }
  | ({ t: "open" | "view" } & TrackItem)
  | { t: "contact"; section: SectionId };

const ENDPOINT = "/api/track";
let queue: Event[] = [];
let firstPageview = true;

function send(events: Event[]) {
  if (!events.length) return;
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

if (typeof window !== "undefined") {
  addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  addEventListener("pagehide", flush);
}

function gtagEvent(name: string, params: Record<string, string>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; clarity?: (...a: unknown[]) => void };
  w.gtag?.("event", name, params);
  w.clarity?.("event", `${name}_${params.section ?? ""}`);
}

export function trackPageview(path: string) {
  // Only the landing pageview carries an external referrer; later client-side
  // navigations are internal by definition.
  const ref = firstPageview ? document.referrer : "";
  firstPageview = false;
  send([{ t: "pv", path, ref }]);
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
