import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { plexSans } from "../_fonts/plex-sans";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { countingSince, report, TRACKED } from "../_lib/analytics";
import { recentMessages, telegramReady, telegramTokenShaped } from "../_lib/messages";
import { redisVars, storeMode } from "../_lib/store";
import { UNCOUNTED } from "../_lib/uncounted";
import { SECTIONS, type SectionId } from "@/content/site";
import { authState } from "./auth";
import { login, logout, setUncounted, testTelegram } from "./actions";
import { DailyChart } from "./DailyChart";
import { ResetStats } from "./ResetStats";
import styles from "./stats.module.css";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

const RANGES = [7, 30, 90, 365] as const;
const NAMES: Record<SectionId, string> = {
  lobby: "Lobby",
  ...(Object.fromEntries(SECTIONS.map((s) => [s.id, s.label])) as Record<string, string>),
} as Record<SectionId, string>;

type Search = { range?: string; section?: string; sort?: string; error?: string; telegram?: string };

const fmt = (n: number) => n.toLocaleString("en-CA");

/** Plain-language reading of Telegram's error for the setup check. */
function telegramHint(error: string) {
  if (/unauthorized/i.test(error)) return "the bot token is wrong.";
  if (/chat not found/i.test(error)) return "the chat id is wrong, or you haven't sent the bot a message yet.";
  if (/^not found$/i.test(error)) return "the bot token is malformed; copy it again from @BotFather.";
  if (/blocked/i.test(error)) return "you've blocked the bot in Telegram.";
  if (/isn't set/i.test(error)) return "add both variables in Vercel, then redeploy.";
  return "";
}

/**
 * What this deployment can see: which database and Telegram variables it was
 * built with (names only), and a button that sends Telegram a test message.
 */
function Setup({ telegram }: { telegram?: string }) {
  const related = Object.keys(process.env)
    .filter((k) => /(^|_)(KV|REDIS|UPSTASH|TELEGRAM)(_|$)/i.test(k))
    .sort();
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  return (
    <section className={styles.card} aria-labelledby="setup">
      <h2 id="setup" className={styles.cardTitle}>
        Setup <span>what this deployment can see · {env}{sha && ` · ${sha}`}</span>
      </h2>
      <ul className={styles.checks}>
        <li data-ok={storeMode === "upstash" || undefined}>
          <strong>Database</strong>
          <span>
            {storeMode === "upstash"
              ? `Connected through ${redisVars?.join(" + ")}.`
              : storeMode === "memory"
                ? "In memory (development): counts and messages reset when the dev server restarts."
                : "Not found. It needs KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)."}
          </span>
        </li>
        <li data-ok={(telegramReady && telegramTokenShaped) || undefined}>
          <strong>Telegram</strong>
          <span>
            Bot token {process.env.TELEGRAM_BOT_TOKEN ? "found" : "missing"}
            {!telegramTokenShaped && " but not shaped like one from @BotFather (digits, a colon, then about 35 letters)"}, chat id{" "}
            {process.env.TELEGRAM_CHAT_ID ? "found" : "missing"}.
            {telegram &&
              (telegram === "ok"
                ? " Test sent: check Telegram."
                : ` Telegram said “${telegram}”: ${telegramHint(telegram)}`)}
          </span>
          <form action={testTelegram}>
            <button type="submit" className={styles.linkBtn}>
              Send test message
            </button>
          </form>
        </li>
      </ul>
      <p className={styles.setupNote}>
        Related variables in this deployment: {related.length ? related.join(", ") : "none"}. Variables only reach a deployment
        built after they were saved, and only in the environments ticked beside them (Production, Preview), so redeploy after
        changing them.
      </p>
    </section>
  );
}
const when = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const w = 96;
  const h = 24;
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`).join(" ");
  return (
    <svg width={w} height={h} className={styles.spark} aria-hidden="true">
      <polyline points={pts} />
    </svg>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const auth = await authState();

  if (auth !== "ok") {
    return (
      <div className={`${styles.root} ${plexSans.variable}`}>
        <main id="main" className={styles.login}>
          <h1 className={styles.loginTitle}>Stats</h1>
          {auth === "unconfigured" ? (
            <p className={styles.note}>Set a STATS_PASSWORD environment variable in Vercel to enable this page.</p>
          ) : (
            <form action={login} className={styles.loginForm}>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
              <button type="submit">Enter</button>
              {sp.error && <p className={styles.error}>That password didn’t match.</p>}
            </form>
          )}
        </main>
      </div>
    );
  }

  const range = RANGES.find((r) => String(r) === sp.range) ?? 30;
  const scope: SectionId | "all" = TRACKED.find((s) => s === sp.section) ?? "all";
  const sort = sp.sort === "views" ? "views" : "opens";
  const [r, messages, since] = await Promise.all([report(range, scope), recentMessages(50), countingSince()]);

  const href = (next: Partial<Record<"range" | "section" | "sort", string>>) => {
    const q = new URLSearchParams({ range: String(range), section: scope, sort, ...next });
    if (q.get("section") === "all") q.delete("section");
    if (q.get("range") === "30") q.delete("range");
    if (q.get("sort") === "opens") q.delete("sort");
    const s = q.toString();
    return s ? `/stats?${s}` : "/stats";
  };

  const ignored = (await cookies()).get(UNCOUNTED)?.value === "1";
  const items = [...r.items].sort((a, b) => b[sort] - a[sort] || b.opens + b.views - (a.opens + a.views)).slice(0, 30);
  const itemMax = Math.max(1, ...items.map((i) => i[sort]));
  const scopeLabel = scope === "all" ? "whole site" : NAMES[scope];

  return (
    <div className={`${styles.root} ${plexSans.variable}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Stats <span>· aidanschreder.com</span>
        </h1>
        <div className={styles.headerRight}>
          <form action={setUncounted}>
            <input type="hidden" name="on" value={ignored ? "0" : "1"} />
            <input type="hidden" name="back" value={href({})} />
            <button
              type="submit"
              role="switch"
              aria-checked={ignored}
              className={`${styles.linkBtn} ${styles.switch}`}
              title={ignored ? "Your visits from this browser aren’t counted" : "Your visits from this browser are counted"}
            >
              <span className={styles.knob} aria-hidden="true" />
              Ignore this device
            </button>
          </form>
          <form action={logout}>
            <button type="submit" className={styles.linkBtn}>
              Sign out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className={styles.main}>
        {/* Until everything works: something missing, a test result, or the newest message not delivered. */}
        {(storeMode !== "upstash" || !telegramReady || !telegramTokenShaped || sp.telegram || messages[0]?.sent === false) && (
          <Setup telegram={sp.telegram} />
        )}

        <nav className={styles.filters} aria-label="Filters">
          <div className={styles.segment} role="group" aria-label="Date range">
            {RANGES.map((d) => (
              <Link key={d} href={href({ range: String(d) })} aria-current={d === range || undefined}>
                {d === 365 ? "1y" : `${d}d`}
              </Link>
            ))}
          </div>
          <div className={styles.segment} role="group" aria-label="Section">
            <Link href={href({ section: "all" })} aria-current={scope === "all" || undefined}>
              All
            </Link>
            {TRACKED.map((s) => (
              <Link key={s} href={href({ section: s })} aria-current={scope === s || undefined}>
                {NAMES[s]}
              </Link>
            ))}
          </div>
        </nav>

        <section className={styles.kpis} aria-label="Totals">
          <div className={styles.hero}>
            <p className={styles.kLabel}>Visitors, {scopeLabel}</p>
            <p className={styles.heroValue}>{fmt(r.totals.visitors)}</p>
            <p className={styles.kSub}>last {range === 365 ? "year" : `${range} days`}</p>
          </div>
          {[
            ["Page views", r.totals.views],
            ["Items opened", r.totals.opens],
            ["Contact clicks", r.totals.contacts],
          ].map(([label, value]) => (
            <div key={label} className={styles.tile}>
              <p className={styles.kLabel}>{label}</p>
              <p className={styles.tileValue}>{fmt(value as number)}</p>
            </div>
          ))}
        </section>

        <section className={styles.card} aria-labelledby="messages">
          <h2 id="messages" className={styles.cardTitle}>
            Messages <span>from the form under each email line · latest {messages.length || ""}</span>
          </h2>
          {!telegramReady && (
            <p className={styles.note}>
              Telegram isn’t set up, so messages only arrive here. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in
              Vercel (see README).
            </p>
          )}
          {messages.length === 0 ? (
            <p className={styles.empty}>No messages yet.</p>
          ) : (
            <ol className={styles.messages}>
              {messages.map((m) => (
                <li key={`${m.at}-${m.email}`}>
                  <p className={styles.messageMeta}>
                    <time dateTime={new Date(m.at).toISOString()}>{when.format(m.at)}</time>
                    <span>{NAMES[m.section] ?? m.section}</span>
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message on aidanschreder.com")}`}>{m.email}</a>
                    {!m.sent && <span>not sent to Telegram{m.error && `: ${m.error}`}</span>}
                  </p>
                  <p className={styles.messageText}>{m.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={styles.card} aria-labelledby="daily">
          <h2 id="daily" className={styles.cardTitle}>
            Daily visitors <span>{scopeLabel}</span>
          </h2>
          <DailyChart data={r.daily} scopeLabel={scopeLabel} />
          <details className={styles.tableView}>
            <summary>Table view</summary>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Visitors</th>
                  <th>Page views</th>
                </tr>
              </thead>
              <tbody>
                {[...r.daily].reverse().map((d) => (
                  <tr key={d.day}>
                    <td>{d.day}</td>
                    <td>{fmt(d.visitors)}</td>
                    <td>{fmt(d.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <section className={styles.card} aria-labelledby="popular">
          <h2 id="popular" className={styles.cardTitle}>
            Most popular <span>projects, photos and pieces · {scopeLabel}</span>
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.num}>#</th>
                <th>Item</th>
                <th className={styles.barCol} aria-hidden="true" />
                <th className={styles.num}>
                  <Link href={href({ sort: "opens" })} aria-current={sort === "opens" || undefined}>
                    Opens
                  </Link>
                </th>
                <th className={styles.num}>
                  <Link href={href({ sort: "views" })} aria-current={sort === "views" || undefined}>
                    Views
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Nothing yet. Opens are counted when someone enlarges a photo, piece or project; views when an item stays on screen for a moment.
                  </td>
                </tr>
              )}
              {items.map((it, i) => (
                <tr key={it.key}>
                  <td className={styles.num}>{i + 1}</td>
                  <td>
                    <a href={it.href || "#"} target="_blank" rel="noopener noreferrer" className={styles.item}>
                      <span className={styles.thumb}>{it.thumb && <Image src={it.thumb} alt="" fill sizes="56px" quality={70} />}</span>
                      <span>
                        <span className={styles.itemTitle}>{it.title}</span>
                        <span className={styles.itemSection}>{NAMES[it.section]}</span>
                      </span>
                    </a>
                  </td>
                  <td className={styles.barCol} aria-hidden="true">
                    <span className={styles.hbar} style={{ width: `${(it[sort] / itemMax) * 100}%` }} />
                  </td>
                  <td className={styles.num}>{fmt(it.opens)}</td>
                  <td className={styles.num}>{fmt(it.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className={styles.cols}>
          <section className={styles.card} aria-labelledby="sections">
            <h2 id="sections" className={styles.cardTitle}>
              By section
            </h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Section</th>
                  <th className={styles.num}>Visitors</th>
                  <th className={styles.num}>Views</th>
                  <th className={styles.num}>Contacts</th>
                  <th aria-label="Daily page views trend" />
                </tr>
              </thead>
              <tbody>
                {r.sections.map((s) => (
                  <tr key={s.id} data-active={scope === s.id || undefined}>
                    <td>
                      <Link href={href({ section: s.id })}>{NAMES[s.id]}</Link>
                    </td>
                    <td className={styles.num}>{fmt(s.visitors)}</td>
                    <td className={styles.num}>{fmt(s.views)}</td>
                    <td className={styles.num}>{fmt(s.contacts)}</td>
                    <td>
                      <Sparkline values={s.daily} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.card} aria-labelledby="referrers">
            <h2 id="referrers" className={styles.cardTitle}>
              Where visitors came from
            </h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Landed on</th>
                  <th className={styles.num}>Visits</th>
                </tr>
              </thead>
              <tbody>
                {r.referrers.length === 0 && (
                  <tr>
                    <td colSpan={3} className={styles.empty}>
                      No external referrers in this range. Direct visits (typed links, DMs, email apps, PDFs) don’t send
                      one; tag the links you share, like aidanschreder.com/engineering?ref=resume, to see them here.
                    </td>
                  </tr>
                )}
                {r.referrers.slice(0, 15).map((x) => (
                  <tr key={`${x.section}|${x.host}`}>
                    <td>
                      {x.host.startsWith("#") ? (
                        <span className={styles.tag} title="From a link tagged ?ref=">
                          {x.host.slice(1)}
                        </span>
                      ) : (
                        x.host
                      )}
                    </td>
                    <td>{NAMES[x.section]}</td>
                    <td className={styles.num}>{fmt(x.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className={`${styles.cardTitle} ${styles.spaced}`}>Top pages</h2>
            <table className={styles.table}>
              <tbody>
                {r.pages.slice(0, 15).map((p) => (
                  <tr key={p.path}>
                    <td>
                      <a href={p.path} target="_blank" rel="noopener noreferrer">
                        {p.path}
                      </a>
                    </td>
                    <td className={styles.num}>{fmt(p.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {r.missing.length > 0 && (
              <>
                <h2 className={`${styles.cardTitle} ${styles.spaced}`}>
                  Not found <span>broken links and old URLs; add a redirect in next.config.ts</span>
                </h2>
                <table className={styles.table}>
                  <tbody>
                    {r.missing.slice(0, 15).map((p) => (
                      <tr key={p.path}>
                        <td>{p.path}</td>
                        <td className={styles.num}>{fmt(p.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        </div>

        {/* Keyed by the reset time, so a finished reset starts it over. */}
        <ResetStats key={since ?? 0} since={since ? when.format(since) : null} />
      </main>
    </div>
  );
}
