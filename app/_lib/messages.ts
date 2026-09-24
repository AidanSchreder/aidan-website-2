import "server-only";

import { createHash } from "node:crypto";
import { SECTIONS, type SectionId } from "@/content/site";
import { day, pipeline, storeMode } from "./store";

// Messages from the form under each section's email line (MessageForm.tsx).
// Each one is forwarded to Aidan's phone by a private Telegram bot and kept
// in Redis for /stats, so none is lost if Telegram is down. The sender only
// ever deals with the website.
//
// Telegram setup: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (see README).
//
//   m:inbox              list   newest first, one JSON Message each (last 500 kept)
//   m:rate:{visitor}     count  messages from one visitor in the last hour
//   m:day:{day}          count  messages from everyone today

export interface Message {
  at: number;
  section: SectionId;
  email: string;
  text: string;
  /** Whether Telegram accepted it. */
  sent: boolean;
}

export const MAX_TEXT = 2000;
export const MAX_EMAIL = 200;
const PER_VISITOR_HOUR = 5;
const PER_DAY = 100;
const KEEP = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tolerates the usual paste slips: spaces, quotes or <brackets> around the
// value, or a leading "bot" copied from @BotFather's example URL.
const envValue = (v?: string) => v?.trim().replace(/^["'<]|["'>]$/g, "").replace(/^bot(?=\d)/i, "");
const TOKEN = envValue(process.env.TELEGRAM_BOT_TOKEN);
const CHAT = envValue(process.env.TELEGRAM_CHAT_ID);
export const telegramReady = Boolean(TOKEN && CHAT);
/** False when the token isn't shaped like one from @BotFather (digits:secret). */
export const telegramTokenShaped = !TOKEN || /^\d{6,}:[\w-]{30,}$/.test(TOKEN);

// Control characters other than newline and tab.
const clean = (v: string) => v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim();

/** The visitor's text and email, or null if either is missing or malformed. */
export function parse(body: Record<string, unknown>): Pick<Message, "section" | "email" | "text"> | null {
  const text = typeof body.text === "string" ? clean(body.text) : "";
  const email = typeof body.email === "string" ? clean(body.email).replace(/\s+/g, "") : "";
  const section = SECTIONS.find((s) => s.id === body.section)?.id;
  if (!section || !text || text.length > MAX_TEXT || email.length > MAX_EMAIL || !EMAIL.test(email)) return null;
  return { section, email, text };
}

/** True once this visitor, or everyone today, has sent too many. */
export async function overLimit(ip: string) {
  if (storeMode === "none") return false;
  const salt = process.env.ANALYTICS_SALT ?? process.env.STATS_PASSWORD ?? "aidanschreder";
  const visitor = createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 16);
  const [mine, , all] = await pipeline([
    ["INCR", `m:rate:${visitor}`],
    ["EXPIRE", `m:rate:${visitor}`, 3600],
    ["INCR", `m:day:${day()}`],
    ["EXPIRE", `m:day:${day()}`, 86_400 * 2],
  ]);
  return Number(mine) > PER_VISITOR_HOUR || Number(all) > PER_DAY;
}

/** Sends text to Aidan's Telegram chat; on failure, Telegram's own reason. */
export async function sendTelegram(text: string): Promise<{ ok: boolean; error?: string }> {
  if (!telegramReady) return { ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID isn't set" };
  try {
    // Plain text (no parse_mode), so nothing the visitor types is read as formatting.
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT, text, link_preview_options: { is_disabled: true } }),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as { description?: string };
    return { ok: false, error: body.description ?? `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Forwards a message to Telegram. False if it isn't set up or didn't take it. */
export async function notify(m: Pick<Message, "section" | "email" | "text">) {
  const label = SECTIONS.find((s) => s.id === m.section)?.label ?? m.section;
  const text = `New message · ${label}\nFrom: ${m.email}\n\n${m.text}`;
  if (!telegramReady) {
    if (process.env.NODE_ENV === "development") console.info(`[message]\n${text}`);
    return false;
  }
  const r = await sendTelegram(text);
  if (!r.ok) console.error("[message] telegram:", r.error);
  return r.ok;
}

/** Keeps a message for /stats. False if there's no store to keep it in. */
export async function save(m: Message) {
  if (storeMode === "none") return false;
  try {
    await pipeline([
      ["LPUSH", "m:inbox", JSON.stringify(m)],
      ["LTRIM", "m:inbox", 0, KEEP - 1],
    ]);
    return true;
  } catch (err) {
    console.error("[message] save", err);
    return false;
  }
}

/** Newest first. */
export async function recentMessages(n = 50): Promise<Message[]> {
  if (storeMode === "none") return [];
  const [list] = await pipeline([["LRANGE", "m:inbox", 0, n - 1]]);
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw) => {
    try {
      return [JSON.parse(String(raw)) as Message];
    } catch {
      return [];
    }
  });
}
