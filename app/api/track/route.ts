import { commandsFor } from "@/app/_lib/analytics";
import { pipeline, storeMode } from "@/app/_lib/store";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|discord|slack|telegram/i;
const PROD_HOSTS = new Set(["aidanschreder.com", "www.aidanschreder.com"]);
const noContent = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  if (storeMode === "none") return noContent();

  const ua = req.headers.get("user-agent") ?? "";
  const host = (req.headers.get("host") ?? "").split(":")[0];
  if (BOT.test(ua)) return noContent();
  // Preview deployments shouldn't pollute production numbers.
  if (process.env.NODE_ENV === "production" && !PROD_HOSTS.has(host)) return noContent();

  const text = await req.text();
  if (text.length > 16_000) return new Response(null, { status: 413 });

  let events: unknown[];
  try {
    const body = JSON.parse(text) as { events?: unknown };
    events = Array.isArray(body.events) ? body.events : [];
  } catch {
    return new Response(null, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "").split(",")[0].trim();
  try {
    await pipeline(commandsFor(events, { ip, ua, host }));
  } catch (err) {
    console.error("[track]", err);
  }
  return noContent();
}
