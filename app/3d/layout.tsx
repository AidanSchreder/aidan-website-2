import Link from "next/link";
import { bankGothic } from "../_fonts/bank-gothic";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { Cursor } from "../_components/Cursor";
import styles from "./three-d.module.css";

export default function ThreeDLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-section="3d" className={`${styles.root} ${bankGothic.variable}`}>
      <div className="noise" aria-hidden="true" />
      <Cursor />

      <nav className={styles.nav} aria-label="3D">
        <Link href="/3d" className={styles.mark}>
          AS
        </Link>
        <div className={styles.navLinks}>
          <Link href="/3d#work">Work</Link>
          <Link href="/3d/about">About</Link>
          <a href="#contact">Contact</a>
          <ThemeToggle />
        </div>
      </nav>

      {children}
    </div>
  );
}
