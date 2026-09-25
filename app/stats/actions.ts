"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resetAnalytics } from "../_lib/analytics";
import { sendTelegram } from "../_lib/messages";
import { UNCOUNTED, UNCOUNTED_MAX_AGE } from "../_lib/uncounted";
import { authState, COOKIE, passwordMatches, token } from "./auth";

async function markUncounted(on: boolean) {
  const jar = await cookies();
  if (!on) return void jar.delete({ name: UNCOUNTED, path: "/" });
  jar.set(UNCOUNTED, "1", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNCOUNTED_MAX_AGE,
  });
}

export async function login(form: FormData) {
  const password = String(form.get("password") ?? "");
  const t = token();
  if (!t || !passwordMatches(password)) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 600));
    redirect("/stats?error=1");
  }
  (await cookies()).set(COOKIE, t, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/stats",
    maxAge: 60 * 60 * 24 * 30,
  });
  // Whoever can sign in here is Aidan: stop counting this device.
  await markUncounted(true);
  redirect("/stats");
}

/** The "Ignore this device" switch. Comes back to the same filters. */
export async function setUncounted(form: FormData) {
  if ((await authState()) !== "ok") redirect("/stats");
  await markUncounted(form.get("on") === "1");
  const back = String(form.get("back") ?? "");
  redirect(/^\/stats(\?|$)/.test(back) ? back : "/stats");
}

/** Setup check: sends a test message and comes back with Telegram's answer. */
export async function testTelegram() {
  if ((await authState()) !== "ok") redirect("/stats");
  const r = await sendTelegram("Test from /stats: messages from the site's contact form will arrive here.");
  redirect(`/stats?telegram=${encodeURIComponent(r.ok ? "ok" : (r.error ?? "failed"))}`);
}

/** Clears every count and starts from zero. Messages and ignored devices are untouched. */
export async function resetStats() {
  if ((await authState()) !== "ok") redirect("/stats");
  await resetAnalytics();
  redirect("/stats");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/stats" });
  redirect("/stats");
}
