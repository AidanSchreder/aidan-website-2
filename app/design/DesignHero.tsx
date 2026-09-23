"use client";

// Hero entrance: the name rises out of a mask (900ms, 90ms stagger), the
// serif discipline line follows with a small counter-rotation, then the ✦
// spins in.
// The circular badge rotates slowly via CSS (stops for reduced motion).

import { motion, useReducedMotion } from "framer-motion";
import styles from "./design.module.css";

const ease = [0.22, 1, 0.36, 1] as const;
const BADGE = "Logos · Identities · Apparel · Style guides · ";

export function DesignHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number, rotate = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { y: "108%", rotate }, animate: { y: "0%", rotate: 0 }, transition: { duration: 0.9, ease, delay } };

  return (
    <header className={styles.hero}>
      <motion.p className={`label ${styles.eyebrow}`} {...rise(0)}>
        Design portfolio
      </motion.p>

      <h1 className={styles.title}>
        <span className={styles.mask}>
          <motion.span className={styles.solid} {...rise(0.05)}>
            Aidan
          </motion.span>
        </span>
        <span className={styles.mask}>
          <motion.span className={styles.hollow} {...rise(0.14)}>
            Schreder
          </motion.span>
        </span>
      </h1>
      <p className={`${styles.mask} ${styles.serifMask}`}>
        <motion.em className={styles.serif} {...rise(0.3, -4)}>
          Brand identity &amp; logo design
        </motion.em>
      </p>

      <motion.svg
        className={styles.star}
        viewBox="0 0 24 24"
        aria-hidden="true"
        initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -90 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, rotate: 0 }}
        transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 120, damping: 12, delay: 0.55 }}
      >
        <path d="M12 0c.9 7.4 3.7 10.2 12 12-8.3 1.8-11.1 4.6-12 12-.9-7.4-3.7-10.2-12-12 8.3-1.8 11.1-4.6 12-12z" fill="currentColor" />
      </motion.svg>

      <motion.p
        className={styles.intro}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 0.6 }}
      >
        Logos and brand systems for robotics teams, a game studio and community events.
      </motion.p>

      <motion.div
        className={styles.badge}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: reduce ? 0 : 0.8 }}
      >
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <text>
            <textPath href="#badge-circle">{BADGE}</textPath>
          </text>
          <path d="M60 50c.4 3.7 1.8 5.1 6 6-4.2.9-5.6 2.3-6 6-.4-3.7-1.8-5.1-6-6 4.2-.9 5.6-2.3 6-6z" />
        </svg>
      </motion.div>
    </header>
  );
}
