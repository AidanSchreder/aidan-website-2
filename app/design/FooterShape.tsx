"use client";

// One small grain shape in the footer, from the header's family, so every
// design page opens and closes on the same motif. It sits on the end of the
// contact address like a sticker (DesignContact.tsx), pops in on the header's
// spring when it scrolls into view, then sways slowly (CSS).
// Reduced motion: fades in and stays still.

import { motion, useReducedMotion } from "framer-motion";
import { Grain } from "./Grain";
import { SWEEP } from "./grain-fills";
import styles from "./design.module.css";

export function FooterShape() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={styles.footerShape}
      aria-hidden="true"
      // Same start state for everyone, as the server renders it (see DesignHero);
      // reduced motion just snaps the scale.
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      // No negative bottom margin: this sits near the end of the page, so on
      // a tall window a shrunk viewport might never reach it.
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        opacity: { duration: 0.4 },
        scale: reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 13 },
      }}
    >
      <Grain fill={SWEEP} shape={{ kind: "rect", round: 0.5 }} seed={5} className={styles.grain} />
    </motion.div>
  );
}
