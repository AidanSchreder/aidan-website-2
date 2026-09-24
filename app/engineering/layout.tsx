import type { Metadata } from "next";
import Link from "next/link";
import { plexSans } from "../_fonts/plex-sans";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { ContactLine } from "../_components/ContactLine";
import { FooterLine } from "../_components/FooterLine";
import { hasResume } from "../_lib/resume";
import { LINKS, sectionRobots } from "@/content/site";
import styles from "./engineering.module.css";

// Kept out of search engines (see `searchable` in content/site.ts); applies to
// /engineering and /engineering/about. Link previews still work.
export const metadata: Metadata = { robots: sectionRobots("engineering") };

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-section="engineering" className={`${styles.root} ${plexSans.variable}`}>
      <nav className={styles.nav} aria-label="Engineering">
        <Link href="/engineering" className={styles.brand}>
          <span className={styles.mark}>AS</span>
          <span className={styles.brandLabel}>Engineering</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/engineering#projects">Projects</Link>
          <Link href="/engineering/about">About</Link>
          {hasResume() && (
            <a href={LINKS.resume} target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {children}

      <footer id="contact" className={styles.footer}>
        <ContactLine section="engineering" form />
        <FooterLine about="/engineering/about">
          <span>Built with Next.js, React and Vercel</span>
        </FooterLine>
      </footer>
    </div>
  );
}
