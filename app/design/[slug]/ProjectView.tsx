"use client";

// Project page: lead image, then the title and write-up beside the details,
// then the remaining slides stacked full width with captions, then the
// previous and next projects.
//
// Motion plan:
//   lead    — unmasks upward (clip-path) as it fades in, 1s.
//   intro   — title, paragraphs and details stagger in after the lead.
//   slides  — each fades up 40px on a soft spring as it enters (once).
//   pager   — the arrow slides out toward where it's going on hover.

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { DesignPiece, Slide } from "@/content/design";
import { trackOpen } from "../../_lib/track";
import { itemFor } from "../DesignWork";
import { Glow, LightEdge } from "../Edge";
import styles from "../design.module.css";

type SizedSlide = Slide & { width: number; height: number };
type Piece = Omit<DesignPiece, "slides"> & { slides: SizedSlide[] };
type Neighbour = { id: string; title: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function ProjectView({ piece, prev, next }: { piece: Piece; prev: Neighbour; next: Neighbour }) {
  const reduce = useReducedMotion();
  const [lead, ...rest] = piece.slides;

  // Counts as an "open" for the /stats ranking, however the visitor got here.
  useEffect(() => {
    trackOpen(itemFor(piece));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece.id]);

  const intro: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.35 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  return (
    <article className={styles.project}>
      <motion.figure
        className={styles.slide}
        // Ends outside the figure so the glow around the frame isn't cut.
        initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(14% -12% -12% -12%)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(-12% -12% -12% -12%)" }}
        transition={{ duration: 1, ease }}
      >
        <Frame slide={lead} title={piece.title} lead />
        <figcaption>{lead.caption}</figcaption>
      </motion.figure>

      <motion.header className={styles.projectIntro} variants={intro} initial="hidden" animate="show">
        <div className={styles.projectText}>
          <motion.h1 variants={item} className={styles.projectTitle}>
            {piece.title}
          </motion.h1>
          {piece.text.map((t) => (
            <motion.p key={t.slice(0, 24)} variants={item}>
              {t}
            </motion.p>
          ))}
        </div>
        <motion.dl variants={item} className={styles.projectMeta}>
          <div>
            <dt>Year</dt>
            <dd>{piece.year}</dd>
          </div>
          {piece.status && (
            <div>
              <dt>Status</dt>
              <dd>{piece.status}</dd>
            </div>
          )}
          <div>
            <dt>Deliverables</dt>
            {piece.deliverables.map((d) => (
              <dd key={d}>{d}</dd>
            ))}
          </div>
        </motion.dl>
      </motion.header>

      {rest.length > 0 && (
        <ol className={styles.slides}>
          {rest.map((s) => (
            <motion.li
              key={s.src}
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 80, damping: 20 }}
            >
              <figure className={styles.slide}>
                <Frame slide={s} title={piece.title} />
                <figcaption>{s.caption}</figcaption>
              </figure>
            </motion.li>
          ))}
        </ol>
      )}

      <nav className={styles.pager} aria-label="More projects">
        <Link href={`/design/${prev.id}`} className={styles.pagerLink} data-dir="prev">
          <span className={styles.pagerArrow} aria-hidden="true">
            ←
          </span>
          <span>
            <span className="label">Previous</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </span>
        </Link>
        <Link href={`/design/${next.id}`} className={styles.pagerLink} data-dir="next">
          <span>
            <span className="label">Next</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </span>
          <span className={styles.pagerArrow} aria-hidden="true">
            →
          </span>
        </Link>
      </nav>
    </article>
  );
}

function Frame({ slide, title, lead }: { slide: SizedSlide; title: string; lead?: boolean }) {
  return (
    <div className={styles.frameWrap} style={{ ["--ratio" as string]: slide.width / slide.height }}>
      {/* Same edge as the grid tiles, for slides whose background matches the page. */}
      <Glow src={slide.src} />
      <div className={styles.frame} style={{ aspectRatio: `${slide.width} / ${slide.height}` }}>
        <Image
          src={slide.src}
          alt={`${title}: ${slide.caption}`}
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          quality={90}
          preload={lead}
        />
      </div>
      <LightEdge />
    </div>
  );
}
