"use client";

// Sidebar + mobile menu for the photography site, and the shared "focus"
// state that links sidebar hover to the photos (and back).

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "../_components/theme/ThemeToggle";
import { ContactLine } from "../_components/ContactLine";
import { FooterLine } from "../_components/FooterLine";
import styles from "./photography.module.css";

interface NavCollection {
  slug: string;
  title: string;
  count: number;
}

/** Which collection is "in focus", and whether the sidebar or a photo put it there. */
export type Focus = { slug: string; from: "nav" | "photo" } | null;

const FocusCtx = createContext<{ focus: Focus; setFocus: (f: Focus) => void }>({
  focus: null,
  setFocus: () => {},
});
export const useFocus = () => useContext(FocusCtx);

export function PhotoShell({ collections, children }: { collections: NavCollection[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [focus, setFocus] = useState<Focus>(null);
  const [menu, setMenu] = useState(false);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(false);
    setFocus(null);
  }

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const active = pathname.split("/")[2] ?? null;

  const list = (
    <ul className={styles.navList} onMouseLeave={() => setFocus(null)}>
      <li>
        <Link href="/photography" aria-current={active === null ? "page" : undefined}>
          Overview
        </Link>
      </li>
      <li>
        <Link href="/photography/about" aria-current={active === "about" ? "page" : undefined}>
          About
        </Link>
      </li>
      <li className={styles.navGap} aria-hidden="true" />
      {collections.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/photography/${c.slug}`}
            aria-current={active === c.slug ? "page" : undefined}
            data-focus={focus?.slug === c.slug || undefined}
            onMouseEnter={() => setFocus({ slug: c.slug, from: "nav" })}
          >
            {c.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <FocusCtx.Provider value={{ focus, setFocus }}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <Link href="/photography" className={styles.name}>
            Aidan Schreder
          </Link>
          <p className={styles.kicker}>Photography</p>
        </div>
        <nav aria-label="Collections" className={styles.sideNav}>
          {list}
        </nav>
        <div className={styles.sideBottom}>
          <ContactLine section="photography" />
          <div className={styles.sideMeta}>
            <FooterLine about="/photography/about" />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <header className={styles.mobileBar}>
        <Link href="/photography" className={styles.name}>
          Aidan Schreder
        </Link>
        <div className={styles.mobileActions}>
          <button className={styles.menuBtn} aria-expanded={menu} aria-controls="photo-menu" onClick={() => setMenu((m) => !m)}>
            {menu ? "Close" : "Menu"}
          </button>
          <ThemeToggle />
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.nav
            id="photo-menu"
            aria-label="Collections"
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {list}
            <ContactLine section="photography" />
            <FooterLine about="/photography/about" />
          </motion.nav>
        )}
      </AnimatePresence>

      <main id="main" className={styles.main}>
        {children}
      </main>
    </FocusCtx.Provider>
  );
}
