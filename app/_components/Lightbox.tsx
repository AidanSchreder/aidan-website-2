"use client";

// Full-screen image viewer shared by photography and engineering.
// Motion: open = fade + 0.98→1 settle (240ms); paging = 24px directional
// slide + crossfade (280ms); touch = swipe. Neighbours preload so paging
// never waits on the network.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./Lightbox.module.css";

export interface LightboxItem {
  src: string;
  caption?: string | null;
  blur?: string;
}

interface Props {
  items: LightboxItem[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
  quality?: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function Lightbox({ items, index, title, onIndex, onClose, quality = 90 }: Props) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = items.length;
  const item = items[index];

  const go = useCallback(
    (delta: number) => {
      if (n < 2) return;
      setDir(delta);
      onIndex((index + delta + n) % n);
    },
    [index, n, onIndex],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const neighbours = n > 1 ? [items[(index + 1) % n], items[(index - 1 + n) % n]] : [];

  return (
    <motion.div
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.24, ease }}
    >
      <div className={styles.top}>
        <span className={styles.title}>{title}</span>
        <button ref={closeRef} className={styles.close} onClick={onClose}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className={styles.stage} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={item.src}
            className={styles.frame}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 24, scale: d === 0 && !reduce ? 0.98 : 1 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -24 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0 : 0.28, ease }}
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
          >
            <Image
              src={item.src}
              alt={item.caption ?? title}
              fill
              sizes="100vw"
              quality={quality}
              loading="eager"
              fetchPriority="high"
              draggable={false}
              placeholder={item.blur ? "blur" : "empty"}
              blurDataURL={item.blur}
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image">
              ←
            </button>
            <button className={`${styles.arrow} ${styles.next}`} onClick={() => go(1)} aria-label="Next image">
              →
            </button>
          </>
        )}
      </div>

      <div className={styles.bottom}>
        <span className={styles.caption} aria-live="polite">
          {item.caption ?? ""}
        </span>
        {n > 1 && (
          <span className={styles.count}>
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Preload neighbours at the same optimized size. */}
      <div className={styles.preload} aria-hidden="true">
        {neighbours.map((nb) => (
          <Image key={nb.src} src={nb.src} alt="" fill sizes="100vw" quality={quality} loading="eager" />
        ))}
      </div>
    </motion.div>
  );
}
