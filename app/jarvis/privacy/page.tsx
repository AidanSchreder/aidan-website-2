import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../../_components/theme/ThemeToggle";
import { EMAIL } from "@/content/site";
import styles from "../jarvis.module.css";

// Privacy policy for Jarvis, linked from its Google sign-in screen. Keep it in
// step with what the app actually does (D:\Applications\Jarvis): which Google
// data it touches, where that data goes, and what stays on the PC.

export const metadata: Metadata = {
  title: "Jarvis privacy policy",
  description: "How Jarvis, Aidan Schreder's personal assistant, uses Google Calendar data.",
  alternates: { canonical: "/jarvis/privacy" },
  robots: { index: false, follow: false },
};

const UPDATED = "November 17, 2026";

export default function JarvisPrivacy() {
  return (
    <div data-section="lobby" className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.top}>
        <span className={`label ${styles.crumb}`}>
          <Link href="/jarvis">Jarvis</Link> / Privacy
        </span>
        <ThemeToggle />
      </header>

      <main id="main" className={styles.main}>
        <h1 className={`${styles.title} ${styles.small}`}>Privacy</h1>
        <p className={styles.lead}>
          Jarvis is a personal assistant that runs on Aidan Schreder&rsquo;s own Windows computer. Aidan is its
          only user; it is not offered to anyone else.
        </p>

        <div className={styles.body}>
          <p className="label">Last updated {UPDATED}</p>

          <h2 className="label">Google data it uses</h2>
          <p>
            After permission is given on Google&rsquo;s sign-in screen, Jarvis uses the Google Calendar API to
            read, create, change and delete events in the signed-in account&rsquo;s calendars, and only when
            asked to. It requests no other Google data.
          </p>

          <h2 className="label">How that data is used</h2>
          <ul>
            <li>Only to carry out the request just made, such as adding a meeting or answering what is on Sunday,
              and to offer an Undo for the change.</li>
            <li>Never sold, never used for advertising, and never used to train AI models.</li>
            <li>Not shared with anyone, except the processing described next.</li>
          </ul>

          <h2 className="label">Where it goes</h2>
          <p>
            Speech is turned into text on the computer itself; audio is never uploaded. The text of a request, and
            the calendar details needed to answer it, are sent to Anthropic&rsquo;s Claude, which works out and
            carries out the task. Anthropic handles that under its{" "}
            <a href="https://www.anthropic.com/legal/privacy" className={styles.link}>
              privacy policy
            </a>
            . No other service receives calendar data.
          </p>

          <h2 className="label">What is stored</h2>
          <p>
            Google&rsquo;s sign-in token is stored only on that computer. Jarvis keeps a local log of requests and
            short summaries of its replies, which can include event titles and times, on the same computer. Details
            of a recent change are held in memory for a few minutes so it can be undone.
          </p>

          <h2 className="label">Removing access</h2>
          <p>
            Access can be removed at any time from{" "}
            <a href="https://myaccount.google.com/connections" className={styles.link}>
              Google Account › Third-party apps &amp; services
            </a>
            . Deleting the token file on the computer also disconnects Jarvis.
          </p>

          <h2 className="label">Google API Services User Data Policy</h2>
          <p>
            Jarvis&rsquo;s use and transfer of information received from Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className={styles.link}
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>

          <p className={styles.contact}>
            Questions:{" "}
            <a href={`mailto:${EMAIL}?subject=Jarvis%20privacy`} className={styles.link}>
              {EMAIL}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
