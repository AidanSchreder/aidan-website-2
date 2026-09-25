import "server-only";

import { createHash } from "node:crypto";
import { SECTIONS, type SectionId } from "@/content/site";
import { day, pipeline, toCounts, toFields, type Command } from "./store";

// ── Key layout ────────────────────────────────────────────────────────────
//   a:pv:{day}          hash  path → pageviews
//   a:sec:{day}         hash  section → pageviews
//   a:uv:{day}:{sec}    HLL   visitor hashes (sec = section id or "all")
//   a:ref:{day}         hash  "{section}|{host}" → landings
//   a:open:{day}        hash  "{section}:{id}" → opens
//   a:view:{day}        hash  "{section}:{id}" → dwell views
//   a:contact:{day}     hash  section → contact-link clicks
//   a:item:{section}:{id}  hash  title / thumb / href (latest seen)
//   a:since             string  ms timestamp of the last reset
// Daily keys expire after ~13 months. Everything here starts with "a:";
// messages live under "m:", so a reset leaves them alone.

export const TRACKED: SectionId[] = ["lobby", ...SECTIONS.map((s) => s.id)];
const TTL = 60 * 60 * 24 * 400;

// Photo ids are "<collection>/<filename>", and filenames may contain spaces.
const ID = /^[\w\-./ ()]{1,120}$/;
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const isSection = (v: unknown): v is SectionId => TRACKED.includes(v as SectionId);

function visitorHash(ip: string, ua: string, today: string) {
  const salt = process.env.ANALYTICS_SALT ?? process.env.STATS_PASSWORD ?? "aidanschreder";
  return createHash("sha256").update(`${today}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 16);
}

function sectionOf(path: string): SectionId {
  if (path === "/") return "lobby";
  const seg = path.split("/")[1];
  return isSection(seg) ? seg : "lobby";
}

function refHost(ref: string, selfHost: string): string | null {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    return host && host !== selfHost.replace(/^www\./, "") ? host : null;
  } catch {
    return null;
  }
}

export interface Visitor {
  ip: string;
  ua: string;
  host: string;
}

/** Turn raw client events into Redis commands. Invalid events are dropped. */
export function commandsFor(events: unknown[], v: Visitor): Command[] {
  const today = day();
  const vh = visitorHash(v.ip, v.ua, today);
  const cmds: Command[] = [];
  const touched = new Set<string>();
  const inc = (key: string, field: string) => {
    cmds.push(["HINCRBY", key, field, 1]);
    touched.add(key);
  };

  for (const raw of events.slice(0, 50)) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;

    if (e.t === "pv") {
      const path = clip(e.path, 200);
      if (!path.startsWith("/")) continue;
      const sec = sectionOf(path);
      inc(`a:pv:${today}`, path);
      inc(`a:sec:${today}`, sec);
      for (const k of [`a:uv:${today}:${sec}`, `a:uv:${today}:all`]) {
        cmds.push(["PFADD", k, vh]);
        touched.add(k);
      }
      const host = refHost(clip(e.ref, 300), v.host);
      if (host) inc(`a:ref:${today}`, `${sec}|${host}`);
    } else if ((e.t === "open" || e.t === "view") && isSection(e.section)) {
      const id = clip(e.id, 120);
      if (!ID.test(id)) continue;
      const key = `${e.section}:${id}`;
      inc(`a:${e.t}:${today}`, key);
      const thumb = clip(e.thumb, 200);
      const href = clip(e.href, 200);
      cmds.push([
        "HSET",
        `a:item:${key}`,
        "title", clip(e.title, 120) || id,
        "section", e.section,
        "thumb", thumb.startsWith("/") ? thumb : "",
        "href", href.startsWith("/") ? href : "",
      ]);
    } else if (e.t === "contact" && isSection(e.section)) {
      inc(`a:contact:${today}`, e.section);
    }
  }

  for (const k of touched) cmds.push(["EXPIRE", k, TTL]);
  return cmds;
}

// ── Reading (for /stats) ──────────────────────────────────────────────────

export interface ItemStat {
  key: string;
  section: SectionId;
  id: string;
  title: string;
  thumb: string;
  href: string;
  opens: number;
  views: number;
}

export interface Report {
  days: string[];
  scope: SectionId | "all";
  /** Per day, within the scope: pageviews and unique visitors. */
  daily: { day: string; views: number; visitors: number }[];
  /** Per section totals over the range (always all sections). */
  sections: { id: SectionId; views: number; visitors: number; contacts: number; daily: number[] }[];
  pages: { path: string; views: number }[];
  referrers: { section: SectionId; host: string; count: number }[];
  items: ItemStat[];
  totals: { views: number; visitors: number; contacts: number; opens: number };
}

const sum = (list: Record<string, number>[]) => {
  const out: Record<string, number> = {};
  for (const m of list) for (const [k, n] of Object.entries(m)) out[k] = (out[k] ?? 0) + n;
  return out;
};
const total = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);

export async function report(rangeDays: number, scope: SectionId | "all" = "all"): Promise<Report> {
  const days = Array.from({ length: rangeDays }, (_, i) => day(rangeDays - 1 - i));
  const perDay = ["pv", "sec", "ref", "open", "view", "contact"] as const;
  const uvKey = (d: string) => `a:uv:${d}:${scope}`;

  const cmds: Command[] = [];
  for (const d of days) for (const k of perDay) cmds.push(["HGETALL", `a:${k}:${d}`]);
  for (const d of days) cmds.push(["PFCOUNT", uvKey(d)]);
  for (const s of TRACKED) cmds.push(["PFCOUNT", ...days.map((d) => `a:uv:${d}:${s}`)]);
  cmds.push(["PFCOUNT", ...days.map(uvKey)]);

  const replies = await pipeline(cmds);
  let i = 0;
  const byDay = days.map(() => {
    const row = {} as Record<(typeof perDay)[number], Record<string, number>>;
    for (const k of perDay) row[k] = toCounts(replies[i++]);
    return row;
  });
  const dailyVisitors = days.map(() => Number(replies[i++] ?? 0));
  const sectionVisitors = TRACKED.map(() => Number(replies[i++] ?? 0));
  const scopeVisitors = Number(replies[i++] ?? 0);

  const inScope = (sec: string) => scope === "all" || sec === scope;
  const pv = sum(byDay.map((r) => r.pv));
  const contacts = sum(byDay.map((r) => r.contact));
  const opens = sum(byDay.map((r) => r.open));
  const views = sum(byDay.map((r) => r.view));
  const refs = sum(byDay.map((r) => r.ref));

  const sections = TRACKED.map((id, n) => ({
    id,
    views: byDay.reduce((t, r) => t + (r.sec[id] ?? 0), 0),
    visitors: sectionVisitors[n],
    contacts: contacts[id] ?? 0,
    daily: byDay.map((r) => r.sec[id] ?? 0),
  }));

  const itemKeys = [...new Set([...Object.keys(opens), ...Object.keys(views)])].filter((k) => inScope(k.slice(0, k.indexOf(":"))));
  const metaReplies = await pipeline(itemKeys.map((k) => ["HGETALL", `a:item:${k}`]));
  const items: ItemStat[] = itemKeys.map((key, n) => {
    const meta = toFields(metaReplies[n]);
    const cut = key.indexOf(":");
    return {
      key,
      section: key.slice(0, cut) as SectionId,
      id: key.slice(cut + 1),
      title: meta.title ?? key,
      thumb: meta.thumb ?? "",
      href: meta.href ?? "",
      opens: opens[key] ?? 0,
      views: views[key] ?? 0,
    };
  });

  const pages = Object.entries(pv)
    .map(([path, v]) => ({ path, views: v }))
    .filter((p) => inScope(sectionOf(p.path)))
    .sort((a, b) => b.views - a.views);

  return {
    days,
    scope,
    daily: days.map((d, n) => ({
      day: d,
      views: scope === "all" ? total(byDay[n].pv) : byDay[n].sec[scope] ?? 0,
      visitors: dailyVisitors[n],
    })),
    sections,
    pages,
    referrers: Object.entries(refs)
      .map(([k, count]) => {
        const [section, host] = k.split("|");
        return { section: section as SectionId, host, count };
      })
      .filter((r) => inScope(r.section))
      .sort((a, b) => b.count - a.count),
    items,
    totals: {
      views: pages.reduce((t, p) => t + p.views, 0),
      visitors: scopeVisitors,
      contacts: scope === "all" ? total(contacts) : contacts[scope] ?? 0,
      opens: items.reduce((t, it) => t + it.opens, 0),
    },
  };
}

// ── Reset (from /stats) ───────────────────────────────────────────────────

const SINCE = "a:since";

/** Deletes every count (all "a:" keys) and notes when counting restarted. Messages are kept. */
export async function resetAnalytics() {
  let cursor = "0";
  do {
    const [reply] = await pipeline([["SCAN", cursor, "MATCH", "a:*", "COUNT", 1000]]);
    if (!Array.isArray(reply)) break;
    const [next, keys] = reply as [string, string[]];
    if (keys.length) await pipeline([["DEL", ...keys]]);
    cursor = String(next);
  } while (cursor !== "0");
  await pipeline([["SET", SINCE, Date.now()]]);
}

/** When the counts were last reset, if ever. */
export async function countingSince(): Promise<number | null> {
  const [v] = await pipeline([["GET", SINCE]]);
  return v ? Number(v) : null;
}
