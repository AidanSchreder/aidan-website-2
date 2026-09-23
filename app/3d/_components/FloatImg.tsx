"use client";

// Parallax render still from v1: grayscale + dimmed at rest, full colour on
// hover, with registration marks and a REF label. Parallax now runs on a
// motion value (no React re-render per scroll frame).

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import styles from "../three-d.module.css";

export interface FloatImgProps {
  label: string;
  width: number;
  height: number;
  top: string;
  left: string;
  speed: number;
  scroll: MotionValue<number>;
  zIndex?: number;
  src: string;
}

export default function FloatImg({ label, width, height, top, left, speed, scroll, zIndex = 1, src }: FloatImgProps) {
  const y = useTransform(scroll, (v) => v * speed);
  const refCode = label.replace(/IMG\s*/i, "REF·");

  return (
    <motion.div className={styles.float} style={{ top, left, width, height, zIndex, y }} aria-hidden="true">
      <div className={styles.floatInner}>
        <span className={`reg-marks ${styles.floatMarks}`}>
          <i />
        </span>
        <div className={styles.floatMeta}>
          <span>{refCode}</span>
          <span>·</span>
          <span>
            {width}×{height}
          </span>
        </div>
        <div className={styles.floatImg}>
          <Image src={src} alt="" fill sizes={`${width}px`} quality={75} />
        </div>
      </div>
    </motion.div>
  );
}
