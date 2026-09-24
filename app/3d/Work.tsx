"use client";

// Portfolio cards + FLIP lightbox carried over from the v1 portfolio page.
// One <img> is rendered at its final position (left 72% of the screen) and
// transformed to start exactly over the card, then released to identity, so
// the card appears to expand into the viewer. The side panel slides in after.

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import type { ThreeDPiece } from "@/content/three-d";
import { trackOpen, type TrackItem } from "../_lib/track";
import { useDwell } from "../_lib/useDwell";
import styles from "./three-d.module.css";

const src = (p: ThreeDPiece, i: number) => `/3d/images/${p.id}/${i}.jpg`;
const itemFor = (p: ThreeDPiece): TrackItem => ({ section: "3d", id: p.id, title: p.title, thumb: src(p, 0), href: `/3d#${p.id}` });

interface Open {
  piece: ThreeDPiece;
  slide: number;
  rect: { top: number; left: number; width: number; height: number };
}

export function Work({ pieces }: { pieces: ThreeDPiece[] }) {
  const [open, setOpen] = useState<Open | null>(null);

  return (
    <>
      <div className={styles.grid}>
        {pieces.map((p, i) => (
          <Card
            key={p.id}
            piece={p}
            index={i}
            hidden={open?.piece.id === p.id}
            onOpen={(slide, r) => {
              setOpen({ piece: p, slide, rect: { top: r.top, left: r.left, width: r.width, height: r.height } });
              trackOpen(itemFor(p));
            }}
          />
        ))}
      </div>
      {open && <FlipLightbox state={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Card({
  piece,
  index,
  hidden,
  onOpen,
}: {
  piece: ThreeDPiece;
  index: number;
  hidden: boolean;
  onOpen: (slide: number, rect: DOMRect) => void;
}) {
  const [slide, setSlide] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const ref = useDwell<HTMLElement>(itemFor(piece));
  const n = piece.captions.length;
  const open = () => viewport.current && onOpen(slide, viewport.current.getBoundingClientRect());

  return (
    <article ref={ref} id={piece.id} className={styles.card} style={{ animationDelay: `${index * 0.07}s` }}>
      <div
        ref={viewport}
        className={styles.slideViewport}
        role="button"
        tabIndex={0}
        data-cursor="View"
        aria-label={`Open ${piece.title} in full view`}
        onClick={open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
      >
        <div style={{ visibility: hidden ? "hidden" : "visible" }} className={styles.slideImg}>
          <Image src={src(piece, slide)} alt={piece.captions[slide]} fill sizes="(max-width: 768px) 100vw, 50vw" quality={80} />
        </div>
        {n > 1 && !hidden && (
          <>
            <button
              className={`${styles.slideArrow} ${styles.prev}`}
              aria-label="Previous slide"
              onClick={(e) => {
                e.stopPropagation();
                setSlide((s) => (s - 1 + n) % n);
              }}
            >
              ←
            </button>
            <button
              className={`${styles.slideArrow} ${styles.next}`}
              aria-label="Next slide"
              onClick={(e) => {
                e.stopPropagation();
                setSlide((s) => (s + 1) % n);
              }}
            >
              →
            </button>
          </>
        )}
        <span className={styles.expandHint} aria-hidden="true">
          ⤢
        </span>
      </div>
      {n > 1 && (
        <div className={styles.dots}>
          {piece.captions.map((c, i) => (
            <button key={i} className={styles.dot} aria-current={i === slide || undefined} aria-label={`Slide ${i + 1}: ${c}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      )}
      <div className={styles.meta}>
        <div className={styles.metaTop}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.tag}>{piece.tags.join(" · ")}</span>
          <span className={styles.date}>{piece.date}</span>
        </div>
        <h3 className={styles.cardTitle}>{piece.title}</h3>
        <p className={styles.cardDesc}>{piece.text[0]}</p>
      </div>
    </article>
  );
}

const EXPAND_MS = 750;
const CLOSE_MS = 500;
const EASE_EXPAND = "cubic-bezier(0.76,0,0.24,1)";
const EASE_CLOSE = "cubic-bezier(0.4,0,0.6,1)";

function startTransforms(rect: Open["rect"]) {
  const narrow = window.innerWidth <= 768;
  const finalW = narrow ? window.innerWidth : window.innerWidth * 0.72;
  const finalH = narrow ? window.innerHeight * 0.6 : window.innerHeight;
  const sx = rect.width / finalW;
  const sy = rect.height / finalH;
  const tx = rect.left + rect.width / 2 - finalW / 2;
  const ty = rect.top + rect.height / 2 - finalH / 2;
  const cover = Math.max(sx, sy);
  return { container: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`, img: `scale(${cover / sx}, ${cover / sy})` };
}

function FlipLightbox({ state, onClose }: { state: Open; onClose: () => void }) {
  const { piece } = state;
  const n = piece.captions.length;
  const [slide, setSlide] = useState(state.slide);
  const [phase, setPhase] = useState<"start" | "open" | "closing">("start");
  const [start] = useState(() => startTransforms(state.rect));
  const closeRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const close = () => {
    if (phaseRef.current === "closing") return;
    setPhase("closing");
    setTimeout(onClose, CLOSE_MS);
  };

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("open"));
    });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (phase === "open") closeRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") setSlide((c) => (c - 1 + n) % n);
      if (e.key === "ArrowRight") setSlide((c) => (c + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // close is stable enough for a keydown handler; re-binding each render is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const { props: imgProps } = getImageProps({
    src: src(piece, slide),
    alt: piece.captions[slide],
    width: 1920,
    height: 1080,
    sizes: "(max-width: 768px) 100vw, 72vw",
    quality: 90,
    loading: "eager",
  });

  const isOpen = phase === "open";
  const isStart = phase === "start";
  const t = (ms: number, ease: string) => (isStart ? "none" : `transform ${ms}ms ${ease}`);
  const transition = isOpen ? t(EXPAND_MS, EASE_EXPAND) : t(CLOSE_MS, EASE_CLOSE);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="flip-title">
      <div
        className={styles.lbBackdrop}
        style={{ opacity: isOpen ? 1 : 0, transition: isStart ? "none" : `opacity ${isOpen ? EXPAND_MS : CLOSE_MS}ms ${isOpen ? EASE_EXPAND : EASE_CLOSE}` }}
        onClick={close}
      />
      <div className={styles.lbImageArea} style={{ transform: isOpen ? "none" : start.container, transition }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- FLIP needs a bare <img> as the transform target */}
        <img
          {...imgProps}
          alt={piece.captions[slide]}
          key={slide}
          className={styles.lbImage}
          decoding="async"
          draggable={false}
          style={{ transform: isOpen ? "none" : start.img, transition }}
        />
        {isOpen && n > 1 && (
          <>
            <button className={`${styles.lbArrow} ${styles.prev}`} onClick={() => setSlide((c) => (c - 1 + n) % n)} aria-label="Previous">
              ←
            </button>
            <button className={`${styles.lbArrow} ${styles.next}`} onClick={() => setSlide((c) => (c + 1) % n)} aria-label="Next">
              →
            </button>
          </>
        )}
        {isOpen && (
          <div className={styles.lbCaption} key={`c-${slide}`}>
            {piece.captions[slide]}
          </div>
        )}
      </div>

      <div className={`${styles.lbPanel} ${isOpen ? styles.lbPanelOpen : ""}`}>
        <div className={styles.lbPanelTop}>
          <button ref={closeRef} className={styles.lbBack} onClick={close}>
            ← Close
          </button>
          <span>
            {String(slide + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>
        <p className={styles.lbDate}>{piece.date}</p>
        <h2 id="flip-title" className={styles.lbTitle}>
          {piece.title}
        </h2>
        <div className={styles.lbTags}>
          {piece.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className={styles.lbDivider} />
        {piece.text.map((p) => (
          <p key={p.slice(0, 24)} className={styles.lbDesc}>
            {p}
          </p>
        ))}
        {piece.links?.map((l) => (
          <a key={l.href} className={styles.lbLink} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
        {n > 1 && (
          <div className={styles.lbDots}>
            {piece.captions.map((c, i) => (
              <button key={i} className={styles.dot} aria-current={i === slide || undefined} aria-label={`Slide ${i + 1}: ${c}`} onClick={() => setSlide(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
