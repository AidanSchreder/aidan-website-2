import { notify, overLimit, parse, save } from "@/app/_lib/messages";

// Receives the contact form (app/_components/MessageForm.tsx). See
// app/_lib/messages.ts for where messages go.

// Faster than a person can write a message and an email address.
const MIN_MS = 1200;

const reply = (ok: boolean, status = 200) => Response.json({ ok }, { status });

export async function POST(req: Request) {
  // Only this site's own pages may post here.
  const origin = req.headers.get("origin");
  try {
    if (!origin || new URL(origin).host !== req.headers.get("host")) return reply(false, 403);
  } catch {
    return reply(false, 403);
  }

  const raw = await req.text();
  if (raw.length > 8_000) return reply(false, 413);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return reply(false, 400);
  }

  // Bots fill the hidden field or submit instantly. They get the same answer
  // as a person, so there's nothing to learn from trying again.
  if (body.company || typeof body.elapsed !== "number" || body.elapsed < MIN_MS) return reply(true);

  const message = parse(body);
  if (!message) return reply(false, 400);

  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "").split(",")[0].trim();
  try {
    if (await overLimit(ip)) return reply(false, 429);
  } catch (err) {
    // A store hiccup shouldn't stop a real message.
    console.error("[message] rate limit", err);
  }

  const sent = await notify(message);
  const saved = await save({ ...message, at: Date.now(), sent });
  return sent || saved ? reply(true) : reply(false, 503);
}
