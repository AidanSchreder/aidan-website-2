"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendTelegram } from "../_lib/messages";
import { authState, COOKIE, passwordMatches, token } from "./auth";

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
  redirect("/stats");
}

/** Setup check: sends a test message and comes back with Telegram's answer. */
export async function testTelegram() {
  if ((await authState()) !== "ok") redirect("/stats");
  const r = await sendTelegram("Test from /stats: messages from the site's contact form will arrive here.");
  redirect(`/stats?telegram=${encodeURIComponent(r.ok ? "ok" : (r.error ?? "failed"))}`);
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/stats" });
  redirect("/stats");
}
