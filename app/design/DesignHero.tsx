"use client";

// Hero entrance: three grain shapes pop in on a spring behind the title
// (150ms stagger), the name rises out of a mask (900ms, 90ms stagger) and the
// serif discipline line follows with a small counter-rotation.
// At rest the rounded square breathes (CSS, 10s); as the hero scrolls away the
// shapes drift apart and the square and triangle turn a little.
// Reduced motion: fades only, no breathing or drift.

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Grain } from "./Grain";
import { DUO, MAIN, SWEEP } from "./grain-fills";
import styles from "./design.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export function DesignHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const to = (from: number, end: number) => [from, reduce ? from : end];
  const squareY = useTransform(scrollYProgress, [0, 1], to(0, 90));
  const squareR = useTransform(scrollYProgress, [0, 1], to(-9, -2));
  const triY = useTransform(scrollYProgress, [0, 1], to(0, -70));
  const triR = useTransform(scrollYProgress, [0, 1], to(10, 34));
  const dotY = useTransform(scrollYProgress, [0, 1], to(0, -160));

  const rise = (delay: number, rotate = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { y: "108%", rotate }, animate: { y: "0%", rotate: 0 }, transition: { duration: 0.9, ease, delay } };
  const pop = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : {
          initial: { opacity: 0, scale: 0.4 },
          animate: { opacity: 1, scale: 1 },
          transition: { opacity: { duration: 0.4, delay }, scale: { type: "spring" as const, stiffness: 70, damping: 13, delay } },
        };

  return (
    <header ref={ref} className={styles.hero}>
      <div className={styles.shapes} aria-hidden="true">
        <motion.div className={styles.squareSlot} style={{ y: squareY, rotate: squareR }}>
          <motion.div className={styles.square} {...pop(0)}>
            <Grain fill={MAIN} shape={{ kind: "rect", round: 0.2 }} seed={3} className={styles.grain} />
          </motion.div>
        </motion.div>
        <motion.div className={styles.triSlot} style={{ y: triY, rotate: triR }}>
          <motion.div className={styles.tri} {...pop(0.15)}>
            <Grain fill={SWEEP} shape={{ kind: "triangle", round: 0.1 }} seed={7} className={styles.grain} />
          </motion.div>
        </motion.div>
        <motion.div className={styles.dotSlot} style={{ y: dotY }}>
          <motion.div className={styles.dot} {...pop(0.3)}>
            <Grain fill={DUO} shape={{ kind: "circle" }} seed={11} className={styles.grain} />
          </motion.div>
        </motion.div>
      </div>

      <h1 className={styles.title}>
        <span className={styles.mask}>
          <motion.span className={styles.solid} {...rise(0.2)}>
            Aidan
          </motion.span>
        </span>
        <span className={styles.mask}>
          <motion.span className={styles.hollow} {...rise(0.29)}>
            Schreder
          </motion.span>
        </span>
      </h1>
      <p className={`${styles.mask} ${styles.serifMask}`}>
        <motion.em className={styles.serif} {...rise(0.45, -4)}>
          Brand identity &amp; logo design
        </motion.em>
      </p>

      <motion.p
        className={styles.intro}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 0.75 }}
      >
        Logos and brand systems for robotics teams, a game studio and community events.
      </motion.p>
    </header>
  );
}
