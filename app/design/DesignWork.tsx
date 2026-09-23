"use client";

// Work grid + case study.
//
// Motion plan:
//   reveal  — cards fade up 60px on a soft spring as they enter (once).
//   rest    — each cover sits at a slight tilt (±1.6°), collage-style.
//   hover   — tilt straightens, cover lifts to 1.02, the image inside drifts
//             to 1.06 more slowly; cursor becomes a "View" disc.
//   open    — the cover itself morphs (shared layoutId) into the case-study
//             frame, 550ms; backdrop fades; text staggers in after 200ms.
//   slides  — direction-aware 40px slide + crossfade.
//   close   — frame morphs back into its card (lifted above the overlay
//             while it travels).

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import type { DesignPiece, Slide } from "@/content/design";
import { trackOpen, type TrackItem } from "../_lib/track";
import { useDwell } from "../_lib/useDwell";
import styles from "./design.module.css";

type SizedSlide = Slide & { width: number; height: number };
type Piece = Omit<DesignPiece, "slides"> & { slides: SizedSlide[] };

const ease = [0.22, 1, 0.36, 1] as const;
const MORPH = { duration: 0.55, ease };

// Collage slots on the 12-column grid: column span, vertical offset, resting tilt.
const SLOTS = [
  { col: "1 / 8", y: 0, r: -1.2 },
  { col: "8 / 13", y: 150, r: 1.4 },
  { col: "2 / 6", y: 0, r: 1.6 },
  { col: "7 / 12", y: 70, r: -1 },
  { col: "1 / 5", y: 10, r: -1.6 },
  { col: "7 / 11", y: 100, r: 1.1 },
];

const itemFor = (p: Piece): TrackItem => ({
  section: "design",
  id: p.id,
  title: p.title,
  thumb: p.slides[0].src,
  href: `/design#${p.id}`,
});

export function DesignWork({ pieces }: { pieces: Piece[] }) {
  const [open, setOpen] = useState<Piece | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const returnTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(returnTimer.current), []);

  const show = (p: Piece) => {
    setOpen(p);
    trackOpen(itemFor(p));
  };
  const openId = open?.id;
  const close = useCallback(() => {
    if (!openId) return;
    // Lift the card above the fading overlay while the frame morphs back into it.
    setReturning(openId);
    clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(() => setReturning(null), 700);
    setOpen(null);
  }, [openId]);

  return (
    <section id="work" className={styles.work} aria-label="Selected work">
      <div className={styles.grid}>
        {pieces.map((p, i) => (
          <Card key={p.id} piece={p} slot={SLOTS[i % SLOTS.length]} lifted={returning === p.id} onOpen={() => show(p)} />
        ))}
      </div>

      <AnimatePresence>{open && <CaseStudy key={open.id} piece={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}

function Card({ piece, slot, lifted, onOpen }: { piece: Piece; slot: (typeof SLOTS)[number]; lifted: boolean; onOpen: () => void }) {
  const reduce = useReducedMotion();
  const ref = useDwell<HTMLElement>(itemFor(piece));
  const cover = piece.slides[0];

  const coverVariants: Variants = {
    rest: { rotate: reduce ? 0 : slot.r, scale: 1 },
    hover: { rotate: 0, scale: reduce ? 1 : 1.02 },
  };
  const imgVariants: Variants = { rest: { scale: 1 }, hover: { scale: reduce ? 1 : 1.06 } };

  return (
    <motion.article
      ref={ref}
      id={piece.id}
      className={styles.card}
      style={{ gridColumn: slot.col, ["--offset" as string]: `${slot.y}px` }}
      initial={{ opacity: 0, y: reduce ? 0 : 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 90, damping: 18 }}
    >
      <motion.button
        className={styles.cardBtn}
        data-cursor="View"
        onClick={onOpen}
        aria-label={`Open ${piece.title} case study`}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
      >
        <motion.div
          layoutId={`cover-${piece.id}`}
          className={styles.cover}
          style={{ aspectRatio: `${cover.width} / ${cover.height}`, zIndex: lifted ? 950 : undefined }}
          variants={coverVariants}
          transition={{ type: "spring", stiffness: 220, damping: 22, layout: MORPH }}
        >
          <motion.div className={styles.coverImg} variants={imgVariants} transition={{ duration: 0.9, ease }}>
            <Image src={cover.src} alt={cover.caption} fill sizes="(max-width: 760px) 100vw, 55vw" quality={80} />
          </motion.div>
        </motion.div>
      </motion.button>

      <div className={styles.caption}>
        <h2>{piece.title}</h2>
        <span className="label">{piece.year}</span>
        <p className="label">
          {piece.status ? `${piece.status} · ` : ""}
          {piece.deliverables.join(" · ")}
        </p>
      </div>
    </motion.article>
  );
}

function CaseStudy({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = piece.slides.length;
  const current = piece.slides[slide];

  const go = useCallback(
    (i: number) => {
      const next = (i + n) % n;
      setDir(i > slide ? 1 : -1);
      setSlide(next);
    },
    [n, slide],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(slide + 1);
      else if (e.key === "ArrowLeft") go(slide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, slide]);

  const panel: Variants = {
    hidden: { opacity: 0, transition: { duration: 0.15 } },
    show: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.2 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  };

  return (
    <div className={styles.case} role="dialog" aria-modal="true" aria-labelledby={`case-${piece.id}`}>
      <motion.div
        className={styles.caseBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      <div className={styles.caseStage} style={{ ["--ratio" as string]: current.width / current.height }}>
        <motion.div layoutId={`cover-${piece.id}`} className={styles.caseFrame} transition={{ layout: MORPH }}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={current.src}
              layout
              className={styles.caseImg}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease }}
            >
              <Image src={current.src} alt={current.caption} fill sizes="70vw" quality={90} loading="eager" fetchPriority="high" style={{ objectFit: "contain" }} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.p className={styles.caseCaption} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <span>{current.caption}</span>
          <span>
            {String(slide + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </motion.p>
      </div>

      <motion.aside className={styles.casePanel} variants={panel} initial="hidden" animate="show" exit="hidden">
        <motion.button ref={closeRef} variants={item} className={styles.caseClose} onClick={onClose}>
          ← Close
        </motion.button>
        <motion.p variants={item} className="label">
          {piece.year}
          {piece.status ? ` · ${piece.status}` : ""}
        </motion.p>
        <motion.h2 variants={item} id={`case-${piece.id}`} className={styles.caseTitle}>
          {piece.title}
        </motion.h2>
        <motion.p variants={item} className={styles.caseDeliverables}>
          {piece.deliverables.join(", ")}
        </motion.p>
        {piece.text.map((t) => (
          <motion.p key={t.slice(0, 24)} variants={item} className={styles.caseText}>
            {t}
          </motion.p>
        ))}
        {n > 1 && (
          <motion.ol variants={item} className={styles.thumbs} aria-label="Slides">
            {piece.slides.map((s, i) => (
              <li key={s.src}>
                <button aria-label={s.caption} aria-current={i === slide || undefined} onClick={() => go(i)}>
                  <Image src={s.src} alt="" fill sizes="72px" quality={70} />
                </button>
              </li>
            ))}
          </motion.ol>
        )}
      </motion.aside>
    </div>
  );
}
