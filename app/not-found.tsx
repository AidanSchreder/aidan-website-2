import type { Metadata } from "next";
import { ThemeToggle } from "./_components/theme/ThemeToggle";
import { NotFoundLine } from "./_components/NotFoundLine";
import styles from "./lobby.module.css";

export const metadata: Metadata = { title: "Not found", robots: { index: false, follow: true } };

// Unknown addresses (old résumé links, typos) get the root card's look
// instead of Next's unstyled default.
export default function NotFound() {
  return (
    <div data-section="lobby" className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.top}>
        <ThemeToggle />
      </header>

      <main id="main" className={styles.main}>
        <h1 className={styles.name}>
          <span>Not</span> <span className={styles.outline}>found</span>
        </h1>
        <NotFoundLine className={styles.contact} />
      </main>
    </div>
  );
}
