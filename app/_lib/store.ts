import "server-only";

// Minimal Redis client for analytics and the message inbox. Production talks
// to Upstash over its REST API (no SDK needed). Connect a free Upstash Redis
// store in the Vercel dashboard (Storage → Upstash → Redis) and it injects
// these env vars:
//   KV_REST_API_URL / KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL / _TOKEN)
// A prefix chosen while connecting (STORAGE_KV_REST_API_URL, …) works too.
//
// Without them: in development an in-memory store is used so /stats can be
// tried locally; in production tracking becomes a no-op.

type Arg = string | number;
export type Command = Arg[];

const urlKey = Object.keys(process.env)
  .filter((k) => /(^|_)(KV_REST_API|REDIS_REST)_URL$/.test(k) && process.env[k.replace(/URL$/, "TOKEN")])
  .sort((a, b) => a.length - b.length)[0];
/** The env var names the store was found under, for the /stats setup check. */
export const redisVars = urlKey ? [urlKey, urlKey.replace(/URL$/, "TOKEN")] : null;
const REST_URL = urlKey && process.env[urlKey];
const TOKEN = urlKey && process.env[urlKey.replace(/URL$/, "TOKEN")];
const DEV = process.env.NODE_ENV === "development";

export type StoreMode = "upstash" | "memory" | "none";
export const storeMode: StoreMode = REST_URL && TOKEN ? "upstash" : DEV ? "memory" : "none";

export async function pipeline(commands: Command[]): Promise<unknown[]> {
  if (!commands.length) return [];
  if (storeMode === "upstash") {
    const res = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(commands.map((c) => c.map(String))),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return out.map((r) => (r.error ? null : r.result));
  }
  if (storeMode === "memory") return commands.map(memory);
  return commands.map(() => null);
}

// ── In-memory stand-in (dev only) ─────────────────────────────────────────
// Implements just the commands analytics and messages use, with Redis-shaped replies.

type Mem = Map<string, Map<string, number | string> | Set<string> | string[] | number>;
const g = globalThis as unknown as { __analyticsMem?: Mem };
const mem: Mem = (g.__analyticsMem ??= new Map());

function hash(key: string) {
  let h = mem.get(key);
  if (!(h instanceof Map)) mem.set(key, (h = new Map()));
  return h;
}

function memory([cmd, ...a]: Command): unknown {
  const args = a.map(String);
  switch (String(cmd).toUpperCase()) {
    case "HINCRBY":
    case "ZINCRBY": {
      const isZ = String(cmd).toUpperCase() === "ZINCRBY";
      const [key, x, y] = args;
      const field = isZ ? y : x;
      const by = Number(isZ ? x : y);
      const h = hash(key);
      const v = Number(h.get(field) ?? 0) + by;
      h.set(field, v);
      return v;
    }
    case "HSET": {
      const [key, ...kv] = args;
      const h = hash(key);
      for (let i = 0; i < kv.length; i += 2) h.set(kv[i], kv[i + 1]);
      return kv.length / 2;
    }
    case "HGETALL": {
      const h = mem.get(args[0]);
      return h instanceof Map ? [...h].flatMap(([k, v]) => [k, String(v)]) : [];
    }
    case "PFADD": {
      const [key, ...els] = args;
      let s = mem.get(key);
      if (!(s instanceof Set)) mem.set(key, (s = new Set()));
      els.forEach((e) => (s as Set<string>).add(e));
      return 1;
    }
    case "PFCOUNT": {
      const union = new Set<string>();
      for (const key of args) {
        const s = mem.get(key);
        if (s instanceof Set) s.forEach((e) => union.add(e));
      }
      return union.size;
    }
    case "INCR": {
      const v = Number(mem.get(args[0]) ?? 0) + 1;
      mem.set(args[0], v);
      return v;
    }
    case "LPUSH": {
      const [key, ...els] = args;
      const l = mem.get(key);
      const list = Array.isArray(l) ? l : [];
      list.unshift(...els.reverse());
      mem.set(key, list);
      return list.length;
    }
    case "LTRIM":
    case "LRANGE": {
      const [key, a0, b0] = args;
      const l = mem.get(key);
      const list = Array.isArray(l) ? l : [];
      const stop = Number(b0) < 0 ? list.length + Number(b0) : Number(b0);
      const range = list.slice(Number(a0), stop + 1);
      if (String(cmd).toUpperCase() === "LRANGE") return range;
      mem.set(key, range);
      return "OK";
    }
    case "EXPIRE":
      return 1;
    default:
      throw new Error(`memory store: unsupported ${cmd}`);
  }
}

/** Redis HGETALL reply → object of numbers. */
export function toCounts(reply: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(reply)) for (let i = 0; i < reply.length; i += 2) out[String(reply[i])] = Number(reply[i + 1]);
  return out;
}

/** Redis HGETALL reply → object of strings. */
export function toFields(reply: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(reply)) for (let i = 0; i < reply.length; i += 2) out[String(reply[i])] = String(reply[i + 1]);
  return out;
}

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD in Toronto time, `offset` days before today. */
export function day(offset = 0, from = Date.now()): string {
  return dayFormat.format(new Date(from - offset * 86_400_000));
}
