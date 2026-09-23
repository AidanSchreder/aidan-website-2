import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// /stats is protected by a single password in the STATS_PASSWORD env var.
// The cookie holds an HMAC of that password, so changing the password logs
// every browser out. In development with no password set, /stats is open.

export const COOKIE = "stats_auth";
const PASSWORD = process.env.STATS_PASSWORD;

export type AuthState = "ok" | "login" | "unconfigured";

export function token(): string | null {
  return PASSWORD ? createHmac("sha256", PASSWORD).update("aidanschreder-stats-v1").digest("hex") : null;
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordMatches(input: string) {
  return !!PASSWORD && safeEqual(input, PASSWORD);
}

export async function authState(): Promise<AuthState> {
  const expected = token();
  if (!expected) return process.env.NODE_ENV === "development" ? "ok" : "unconfigured";
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  return safeEqual(got, expected) ? "ok" : "login";
}
