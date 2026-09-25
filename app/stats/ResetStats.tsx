"use client";

// "Reset all counts", in two steps: the first click only asks. Escape or
// Cancel backs out. Messages and ignored devices aren't affected.

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { resetStats } from "./actions";
import styles from "./stats.module.css";

export function ResetStats({ since }: { since: string | null }) {
  const [asking, setAsking] = useState(false);
  // Only after backing out does focus go back to the first button.
  const [backedOut, setBackedOut] = useState(false);
  const reduce = useReducedMotion();
  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -4 },
    transition: { duration: 0.18 },
  };

  const cancel = () => {
    setAsking(false);
    setBackedOut(true);
  };

  return (
    <section className={styles.reset} aria-label="Reset">
      <p className={styles.since}>{since ? `Counting since ${since}` : "Counting since launch"}</p>
      <AnimatePresence mode="wait" initial={false}>
        {asking ? (
          <motion.form
            key="ask"
            action={resetStats}
            className={styles.resetAsk}
            onKeyDown={(e) => e.key === "Escape" && cancel()}
            {...fade}
          >
            <span>Delete every count and start from zero? Messages stay, and ignored devices stay ignored.</span>
            <Confirm />
            <button type="button" className={styles.linkBtn} onClick={cancel} autoFocus>
              Cancel
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="start"
            type="button"
            className={styles.linkBtn}
            onClick={() => setAsking(true)}
            autoFocus={backedOut}
            {...fade}
          >
            Reset all counts
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

function Confirm() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${styles.linkBtn} ${styles.danger}`} disabled={pending}>
      {pending ? "Deleting…" : "Delete counts"}
    </button>
  );
}
