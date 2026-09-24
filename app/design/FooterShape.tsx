"use client";

// One small grain shape in the footer, from the header's family, so every
// design page opens and closes on the same motif. It pops in on the header's
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
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      // No negative bottom margin: this sits ~115px from the end of the page,
      // so on a tall window a shrunk viewport would never reach it.
      viewport={{ once: true, amount: 0.5 }}
      transition={
        reduce
          ? { duration: 0.4 }
          : { opacity: { duration: 0.4 }, scale: { type: "spring", stiffness: 70, damping: 13 } }
      }
    >
      <Grain fill={SWEEP} shape={{ kind: "rect", round: 0.5 }} seed={5} className={styles.grain} />
    </motion.div>
  );
}
