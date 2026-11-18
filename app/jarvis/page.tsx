import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { EMAIL } from "@/content/site";
import styles from "./jarvis.module.css";

// Jarvis is a personal assistant Aidan built for his own PC. Its Google
// sign-in screen links to this page (home page) and to /jarvis/privacy, as
// Google requires. Linked from nowhere else and kept out of search.

export const metadata: Metadata = {
  title: "Jarvis",
  description: "Jarvis, a push-to-talk assistant for Windows that Aidan Schreder built for his own use.",
  alternates: { canonical: "/jarvis" },
  robots: { index: false, follow: false },
};

export default function Jarvis() {
  return (
    <div data-section="lobby" className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.top}>
        <span className="label">Personal software</span>
        <ThemeToggle />
      </header>

      <main id="main" className={styles.main}>
        <h1 className={styles.title}>Jarvis</h1>
        <p className={styles.lead}>
          A push-to-talk assistant for my Windows PC. I hold a key, say what I want, and let go; it does the task
          and shows what it did in a small card above the taskbar.
        </p>

        <div className={styles.body}>
          <p>
            It adds, moves and removes events in my Google Calendar, shows the coming week on my desktop
            background, converts files to PDF, looks things up on the web, opens apps and sets timers. Speech is turned into text on my own computer, and Anthropic&rsquo;s
            Claude works out and carries out each request.
          </p>
          <p>
            Jarvis is built for my own use. It isn&rsquo;t available to download, and nobody else can sign in
            to it.
          </p>
          <p>
            <Link href="/jarvis/privacy" className={styles.link}>
              Privacy policy
            </Link>
          </p>
          <p className={styles.contact}>
            Questions:{" "}
            <a href={`mailto:${EMAIL}?subject=Jarvis`} className={styles.link}>
              {EMAIL}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
