import type { Metadata } from "next";
import { ThemeToggle } from "./_components/theme/ThemeToggle";
import { ContactLine } from "./_components/ContactLine";
import styles from "./lobby.module.css";

// The root page is a card, not a directory: name and contact only. Each
// section is reached by a link Aidan sends, so the site never presents the
// whole profile in one place.

export const metadata: Metadata = {
  title: { absolute: "Aidan Schreder" },
  description: "Aidan Schreder.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div data-section="lobby" className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.top}>
        <ThemeToggle />
      </header>

      <main id="main" className={styles.main}>
        <h1 className={styles.name}>
          <span>Aidan</span> <span className={styles.outline}>Schreder</span>
        </h1>
        <ContactLine section="lobby" className={styles.contact} />
      </main>
    </div>
  );
}
