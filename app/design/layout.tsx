import Link from "next/link";
import { instrumentSerif } from "../_fonts/instrument-serif";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { ContactLine } from "../_components/ContactLine";
import { FooterLine } from "../_components/FooterLine";
import { Cursor } from "../_components/Cursor";
import styles from "./design.module.css";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-section="design" className={`${styles.root} ${instrumentSerif.variable}`}>
      <div className="noise" aria-hidden="true" />
      <Cursor />

      <nav className={styles.nav} aria-label="Design">
        <Link href="/design" className={styles.brand}>
          <span className={styles.mark}>AS</span>
          <em>Design</em>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/design#work">Work</Link>
          <Link href="/design/about">About</Link>
          <a href="#contact">Contact</a>
          <ThemeToggle />
        </div>
      </nav>

      {children}

      <footer id="contact" className={styles.footer}>
        <ContactLine section="design" className={styles.contact} />
        <FooterLine about="/design/about" />
      </footer>
    </div>
  );
}
