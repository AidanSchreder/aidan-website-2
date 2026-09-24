"use client";

// Work grid. Tiles sit slightly tilted, collage-style, and each one slowly
// crossfades through its homepage slides while it's on screen (tiles start in
// a wave, not all at once). Hovering straightens the tile, fades the image out
// and brings the project name up in its place. On touch the name sits under
// the tile instead. Reduced motion: first slide only, no cycling.
//
// Layout (see `place`): every tile has the same area whatever its proportions,
// so a wide project and a square one carry the same weight. Tiles go in rows
// of two spread evenly across the full page width: the space at the left
// edge, between the two and at the right edge is the same. Each tile sits
// below whatever is above it by the average of the two rows' spacing, so the
// space around a tile matches its row. Corners are rounded in proportion to
// the tile's short side, and every image gets the glow and light edge from
// Edge.tsx.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Slide } from "@/content/design";
import type { TrackItem } from "../_lib/track";
import { useDwell } from "../_lib/useDwell";
import { Glow, LightEdge } from "./Edge";
import styles from "./design.module.css";

interface Piece {
  id: string;
  title: string;
  /** Homepage slides, in order. */
  slides: Slide[];
  /** Width / height of the first homepage slide; the tile takes this shape. */
  ratio: number;
}

const HOLD = 6500; // ms between changes
const FADE = 1800; // ms crossfade; matches .tileImg in design.module.css
const WAVE = 1100; // ms between neighbouring tiles' first change

// Geometry, as fractions of the page width.
const GAP = 0.045; // the tightest spacing: a row of the two widest tiles
const RIGHT_DROP = 0.06; // right-hand tiles start this much lower, for the stagger
const TILT = [-1.6, 1.3, 1.1, -1.2, 1.5, -1.8]; // resting tilt per tile, degrees
const CORNER = 0.05; // corner radius / short side; the header's rounded square uses 0.2

export const itemFor = (p: Pick<Piece, "id" | "title" | "slides">): TrackItem => ({
  section: "design",
  id: p.id,
  title: p.title,
  thumb: p.slides[0].src,
  href: `/design/${p.id}`,
});

function place(pieces: Piece[]) {
  const widest = Math.max(...pieces.map((p) => p.ratio));
  // Same area for every tile, sized so a row of the two widest fits with GAP
  // at both edges and between.
  const size = (p: Piece) => {
    const w = ((1 - 3 * GAP) / 2) * Math.sqrt(p.ratio / widest);
    return { w, h: w / p.ratio };
  };
  const placed: { x: number; y: number; w: number; h: number; gap: number }[] = [];
  const out = [];
  for (let i = 0; i < pieces.length; i += 2) {
    const pair = pieces.slice(i, i + 2).map((p) => ({ p, ...size(p) }));
    // Spread evenly: the same space at each edge of the page and between the two.
    const gap = (1 - pair.reduce((sum, t) => sum + t.w, 0)) / (pair.length + 1);
    let x = gap;
    for (const [k, t] of pair.entries()) {
      // Below the lowest tile it sits under, by the two rows' average spacing
      // (held within 1–2.5× GAP so a lone last tile doesn't float off).
      const y = placed
        .filter((q) => q.x < x + t.w - 1e-6 && q.x + q.w > x + 1e-6)
        .reduce((top, q) => {
          const space = Math.min(Math.max((q.gap + gap) / 2, GAP), 2.5 * GAP);
          return Math.max(top, q.y + q.h + space);
        }, k === 1 ? RIGHT_DROP : 0);
      placed.push({ x, y, w: t.w, h: t.h, gap });
      // On phones it's one column; the widest fills it and the rest keep the same area.
      const m = Math.sqrt(t.p.ratio / widest);
      out.push({
        piece: t.p,
        x,
        y,
        w: t.w,
        corner: CORNER * Math.min(t.w, t.h),
        wm: m,
        cornerM: CORNER * Math.min(m, m / t.p.ratio),
        tilt: TILT[(i + k) % TILT.length],
        side: k,
      });
      x += t.w + gap;
    }
  }
  const height = Math.max(0, ...placed.map((q) => q.y + q.h));
  return { tiles: out, height };
}

export function DesignWork({ pieces }: { pieces: Piece[] }) {
  const { tiles, height } = place(pieces);
  return (
    <section id="work" className={styles.work} aria-label="Selected work">
      <ul className={styles.tiles} style={{ ["--height" as string]: height }}>
        {tiles.map((t, i) => (
          <Tile key={t.piece.id} tile={t} index={i} />
        ))}
      </ul>
    </section>
  );
}

function Tile({ tile, index }: { tile: ReturnType<typeof place>["tiles"][number]; index: number }) {
  const { piece } = tile;
  const slides = piece.slides;
  const reduce = useReducedMotion();
  const ref = useDwell<HTMLLIElement>(itemFor(piece));
  const [shown, setShown] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  const cycling = visible && !hovered && !reduce && slides.length > 1;
  useEffect(() => {
    if (!cycling) return;
    // First change comes in a wave across the grid; after that, a steady beat.
    const delay = started.current ? HOLD : 3000 + index * WAVE;
    const t = setTimeout(() => {
      if (document.visibilityState === "hidden") return;
      started.current = true;
      setPrev(shown);
      setShown((shown + 1) % slides.length);
    }, delay);
    return () => clearTimeout(t);
  }, [cycling, shown, index, slides.length]);

  // The outgoing slide stays up underneath until the new one has faded in
  // over it, so the tile never dips to the background mid-change.
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), FADE + 100);
    return () => clearTimeout(t);
  }, [prev]);

  // Only the outgoing, current and next slides are in the DOM: the next one
  // has loaded by the time it fades in, and the rest wait until needed.
  const next = (shown + 1) % slides.length;
  const layer = (i: number) => (i === shown ? "shown" : i === prev ? "prev" : i === next ? "next" : null);
  const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

  return (
    <motion.li
      ref={ref}
      className={styles.tileItem}
      style={{
        ["--x" as string]: pct(tile.x),
        ["--y" as string]: tile.y,
        ["--w" as string]: pct(tile.w),
        ["--w-m" as string]: pct(tile.wm),
        ["--ratio" as string]: piece.ratio,
        ["--corner" as string]: tile.corner,
        ["--corner-m" as string]: tile.cornerM,
        ["--tilt" as string]: `${tile.tilt}deg`,
      }}
      initial={{ opacity: 0, y: reduce ? 0 : 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 80, damping: 18, delay: tile.side * 0.08 }}
    >
      <Link
        href={`/design/${piece.id}`}
        className={styles.tileLink}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <span className={styles.tileFrame}>
          <Glow src={slides[shown].src} />
          <span className={styles.tileMedia}>
            {slides.map((s, i) =>
              layer(i) ? (
                <Image
                  key={s.src}
                  src={s.src}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                  quality={80}
                  className={styles.tileImg}
                  data-layer={layer(i)}
                />
              ) : null,
            )}
          </span>
          <LightEdge />
        </span>
        {/* Also the link's accessible name; the slides are decorative here. */}
        <span className={styles.tileName}>{piece.title}</span>
      </Link>
    </motion.li>
  );
}
