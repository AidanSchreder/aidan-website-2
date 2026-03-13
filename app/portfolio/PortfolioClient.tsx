"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SpaceMono, fontConfig } from "../fonts.config";
import { themeConfig, portfolioDarkVars, portfolioLightVars } from "../theme.config";
import { useTheme } from "../components/ThemeProvider";
import { useFastCursor } from "../components/useFastCursor";
import { trackGA4Event } from "../components/GoogleAnalytics";

import {
  PORTFOLIO_PIECES,
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_CAPTIONS,
  LAST_UPDATED,
  type PortfolioPiece,
} from "../content.config";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Piece = PortfolioPiece;

interface LightboxState {
  piece: Piece;
  slide: number;
  rect: { top: number; left: number; width: number; height: number };
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const CATEGORIES = PORTFOLIO_CATEGORIES;
const PIECES      = PORTFOLIO_PIECES;
const CAPTIONS    = PORTFOLIO_CAPTIONS;

function getCaption(pieceId: string, slideIndex: number): string {
  return CAPTIONS[`${pieceId}-${slideIndex}`] || `Image ${slideIndex + 1}`;
}

// ── IMAGE PATH HELPER ─────────────────────────────────────────────────────────
// To add images to a project, create a folder inside your Next.js /public
// directory following this structure:
//
//   public/
//   └── images/
//       └── portfolio/
//           ├── 01/          ← matches the piece `id` field (e.g. "01")
//           │   ├── 0.jpg    ← slide index, zero-based (0.jpg, 1.jpg, 2.jpg …)
//           │   ├── 1.jpg
//           │   └── ...
//           ├── 02/
//           │   ├── 0.jpg
//           │   └── ...
//           └── ...
//
function getSlideImagePath(pieceId: string, slideIndex: number): string {
  return `/images/portfolio/${pieceId}/${slideIndex}.jpg`;
}

// ── SLIDESHOW (card version) ──────────────────────────────────────────────────
function Slideshow({
  piece,
  isActive,
  onOpen,
}: {
  piece: Piece;
  isActive: boolean;
  onOpen: (slide: number, rect: DOMRect) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [missingSlides, setMissingSlides] = useState<Record<number, boolean>>({});
  const viewportRef = useRef<HTMLDivElement>(null);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c - 1 + piece.slides) % piece.slides);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c + 1) % piece.slides);
  };

  const handleOpen = () => {
    if (!viewportRef.current) return;
    onOpen(current, viewportRef.current.getBoundingClientRect());
  };

  return (
    <div className="slideshow">
      <div
        className="slide-viewport slide-viewport-clickable"
        ref={viewportRef}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label={`Open ${piece.title} in full view`}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleOpen(); }}
      >
        <div style={{ visibility: isActive ? "hidden" : "visible", width: "100%", height: "100%", position: "absolute", inset: 0 }}>
          {missingSlides[current] ? (
            <div className="slide-placeholder">
              <span className="slide-label">{piece.title}</span>
              <span className="slide-count">{String(current + 1).padStart(2, "0")} / {String(piece.slides).padStart(2, "0")}</span>
              <span className="slide-hint">Add image: /public/images/portfolio/{piece.id}/{current}.jpg</span>
            </div>
          ) : (
            // next/image with fill — slide-viewport has aspect-ratio:4/3 and
            // position:relative so fill resolves correctly. The onError fallback
            // switches to the placeholder if the file is missing.
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                key={`${piece.id}-${current}`}
                src={getSlideImagePath(piece.id, current)}
                alt={getCaption(piece.id, current)}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                onError={() => setMissingSlides(prev => ({ ...prev, [current]: true }))}
                draggable={false}
              />
            </div>
          )}
        </div>

        {!isActive && piece.slides > 1 && (
          <>
            <button className="slide-arrow slide-arrow-prev" onClick={prev} aria-label="Previous slide">←</button>
            <button className="slide-arrow slide-arrow-next" onClick={next} aria-label="Next slide">→</button>
          </>
        )}
        {!isActive && <div className="slide-expand-hint">⤢</div>}
      </div>

      {piece.slides > 1 && (
        <div className="slide-dots">
          {Array.from({ length: piece.slides }).map((_, i) => (
            <button
              key={i}
              className={`slide-dot${i === current ? " slide-dot-active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── LIGHTBOX ──────────────────────────────────────────────────────────────────
// Architecture: one single <img> element, always rendered at its FINAL position
// (fixed, filling the left panel). A CSS transform makes it *appear* to start
// at the card's bounding rect, then it animates to identity = no duplicate copy.
//
// The lightbox image intentionally uses a raw <img> tag rather than next/image.
// Reason: the FLIP animation drives inline `transform` and `transition` styles
// directly on the img element. next/image wraps the img in a <span>, which
// would break the transform target and cause the animation to fail.
// `loading="lazy"` and `decoding="async"` are applied manually instead.

const EASING_EXPAND = "cubic-bezier(0.76,0,0.24,1)";
const EASING_CLOSE  = "cubic-bezier(0.4,0,0.6,1)";
const EXPAND_MS     = 750;
const CLOSE_MS      = 500;
const PANEL_DELAY   = 420;

function Lightbox({
  state,
  onClose,
}: {
  state: LightboxState;
  onClose: () => void;
  isDark: boolean;
}) {
  const { piece, rect } = state;
  const [slide, setSlide] = useState(state.slide);
  const [missingSlides, setMissingSlides] = useState<Record<number, boolean>>({});
  const [phase, setPhase] = useState<"start" | "open" | "closing">("start");
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const handleClose = () => {
    if (phaseRef.current === "closing") return;
    setPhase("closing");
    setTimeout(onClose, CLOSE_MS);
  };

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => { setPhase("open"); });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  // Move focus to close button when lightbox opens
  useEffect(() => {
    if (phase === "open") {
      closeButtonRef.current?.focus();
    }
  }, [phase]);

  // Focus trap — keep focus inside dialog while open
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key === "ArrowLeft")  setSlide(c => (c - 1 + piece.slides) % piece.slides);
      if (e.key === "ArrowRight") setSlide(c => (c + 1) % piece.slides);
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [piece.slides]);

  const computeTransforms = () => {
    if (typeof window === "undefined") return { container: "none", img: "none" };
    const finalW = window.innerWidth * 0.72;
    const finalH = window.innerHeight;
    const finalCX = finalW / 2;
    const finalCY = finalH / 2;
    const cardCX = rect.left + rect.width  / 2;
    const cardCY = rect.top  + rect.height / 2;
    const scaleX = rect.width  / finalW;
    const scaleY = rect.height / finalH;
    const tx = cardCX - finalCX;
    const ty = cardCY - finalCY;
    const containerTransform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
    const coverRatio = Math.max(scaleX, scaleY);
    const imgCounterX = coverRatio / scaleX;
    const imgCounterY = coverRatio / scaleY;
    const imgTransformStart = `scale(${imgCounterX}, ${imgCounterY})`;
    return { container: containerTransform, img: imgTransformStart };
  };

  const initialTransforms = useRef(computeTransforms());

  const isOpen  = phase === "open";
  const isStart = phase === "start";

  const containerTransform = isOpen ? "translate(0,0) scale(1)" : initialTransforms.current.container;
  const containerTransition = isStart ? "none" : isOpen
    ? `transform ${EXPAND_MS}ms ${EASING_EXPAND}`
    : `transform ${CLOSE_MS}ms ${EASING_CLOSE}`;

  const imgInnerTransform = isOpen ? "scale(1,1)" : initialTransforms.current.img;
  const imgInnerTransition = isStart ? "none" : isOpen
    ? `transform ${EXPAND_MS}ms ${EASING_EXPAND}`
    : `transform ${CLOSE_MS}ms ${EASING_CLOSE}`;

  const backdropOpacity = isOpen ? 1 : 0;
  const backdropTransition = isStart ? "none" : isOpen
    ? `opacity ${EXPAND_MS}ms ${EASING_EXPAND}`
    : `opacity ${CLOSE_MS}ms ${EASING_CLOSE}`;

  const panelVisible = isOpen;
  const panelDelay = isOpen ? `${PANEL_DELAY}ms` : "0ms";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lb-title"
    >
      <div
        className="lb-backdrop"
        style={{ opacity: backdropOpacity, transition: backdropTransition }}
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        aria-hidden="true"
      />

      <div
        ref={imageAreaRef}
        className="lb-image-area"
        style={{ transform: containerTransform, transition: containerTransition }}
      >
        {missingSlides[slide] ? (
          <div className="lb-image-placeholder">
            <span className="lb-image-title">{piece.title}</span>
            <span className="lb-image-num">{String(slide + 1).padStart(2, "0")} / {String(piece.slides).padStart(2, "0")}</span>
            <span className="lb-image-hint">Add image: /public/images/portfolio/{piece.id}/{slide}.jpg</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`lb-${piece.id}-${slide}`}
            src={getSlideImagePath(piece.id, slide)}
            alt={getCaption(piece.id, slide)}
            onError={() => setMissingSlides(prev => ({ ...prev, [slide]: true }))}
            className="lb-image"
            loading="lazy"
            decoding="async"
            style={{ transform: imgInnerTransform, transition: imgInnerTransition }}
            draggable={false}
          />
        )}

        {isOpen && piece.slides > 1 && (
          <>
            <button className="lb-arrow lb-arrow-prev" onClick={() => setSlide(c => (c - 1 + piece.slides) % piece.slides)} aria-label="Previous">←</button>
            <button className="lb-arrow lb-arrow-next" onClick={() => setSlide(c => (c + 1) % piece.slides)} aria-label="Next">→</button>
          </>
        )}

        {isOpen && (
          <div className="lb-caption" key={`caption-${slide}`}>
            {getCaption(piece.id, slide)}
          </div>
        )}
      </div>

      <div
        className={`lb-side-panel${panelVisible ? " lb-side-panel-visible" : ""}`}
        style={{ transitionDelay: panelDelay }}
      >
        <div className="lb-side-top">
          <button ref={closeButtonRef} className="lb-back" onClick={handleClose}>← Close</button>
          <span className="lb-top-counter">{String(slide + 1).padStart(2, "0")} / {String(piece.slides).padStart(2, "0")}</span>
        </div>

        <div className="lb-side-body">
          <div className="lb-side-meta">
            <span className="lb-top-id">{piece.id}</span>
            <span className="lb-top-date">{piece.date}</span>
          </div>
          <h2 id="lb-title" className="lb-side-title">{piece.title}</h2>

          <div className="lb-cats lb-cats-side">
            {piece.categories.map(c => (
              <span key={c} className="lb-cat">{c}</span>
            ))}
          </div>

          <div className="lb-side-divider" />

          <p className="lb-desc">{piece.desc.split("\n\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <><br /><br /></>}</span>
          ))}</p>
        </div>

        {piece.slides > 1 && (
          <div className="lb-side-dots">
            {Array.from({ length: piece.slides }).map((_, i) => (
              <button
                key={i}
                className={`lb-dot${i === slide ? " lb-dot-active" : ""}`}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PIECE CARD ────────────────────────────────────────────────────────────────
function PieceCard({
  piece,
  index,
  isActive,
  onOpen,
}: {
  piece: Piece;
  index: number;
  isActive: boolean;
  onOpen: (piece: Piece, slide: number, rect: DOMRect) => void;
}) {
  return (
    <article
      className="piece-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <Slideshow
        piece={piece}
        isActive={isActive}
        onOpen={(slide, rect) => onOpen(piece, slide, rect)}
      />
      <div className="piece-meta">
        <div className="piece-meta-top">
          <span className="piece-id">{piece.id}</span>
          <span className="piece-cat-tag">{piece.categories.join(" · ")}</span>
          <span className="piece-date">{piece.date}</span>
        </div>
        <h2 className="piece-title">{piece.title}</h2>
        <p className="piece-desc">{piece.desc.split("\n\n").map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <><br /><br /></>}</span>
        ))}</p>
      </div>
    </article>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { isDark, setIsDark }             = useTheme();
  const [selected, setSelected]           = useState<string>("");
  const [hasEverSelected, setHasEverSelected] = useState(false);
  const [lightbox, setLightbox]           = useState<LightboxState | null>(null);

  const { dotRef, ringRef } = useFastCursor();

  const footerRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const openLightbox = (piece: Piece, slide: number, rect: DOMRect) => {
    setLightbox({ piece, slide, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } });
    trackGA4Event("project_viewed", { project: piece.title, category: piece.categories.join(", ") });
  };

  const closeLightbox = () => setLightbox(null);

  const ftScroll = footerRef.current ? scrollY - footerRef.current.offsetTop : 0;

  const selectCategory = (cat: string) => {
    const next = selected === cat ? "" : cat;
    setSelected(next);
    if (next !== "") {
      setHasEverSelected(true);
      trackGA4Event("category_selected", { category: next });
    }
  };

  const filtered = selected === ""
    ? []
    : PIECES.filter(p => p.categories.includes(selected));

  const showGrid  = selected !== "";
  const showEmpty = hasEverSelected && selected !== "" && filtered.length === 0;

  return (
    <div className={SpaceMono.variable} data-theme={isDark ? "dark" : "light"}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <style>{`
        ${fontConfig.fontFace ?? ""}

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        h1, h2, h3, h4, h5, h6 {
        font-weight: 400;
        }
        :root {
          --font-display: ${fontConfig.display};
          --font-title:   ${fontConfig.title};
          --font-mono:    ${fontConfig.mono};
        }

        /* ── THEME TOKENS ── */
        [data-theme="dark"] {
          ${portfolioDarkVars()}
        }

        [data-theme="light"] {
          ${portfolioLightVars()}
        }

        html { scroll-behavior: smooth; }
        body { font-family: var(--font-mono); overflow-x: hidden; cursor: none; }

        @media (pointer: fine) {
          .theme-toggle, .cta-button,
          .nav-back, .lb-dot, .chip { cursor: none; }
        }

        /* ── SKIP LINK ── */
        .skip-link {
          position: absolute; top: 0; left: 16px; z-index: 10000;
          padding: 12px 20px; background: var(--fg); color: var(--bg);
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          transform: translateY(-100%);
          transition: transform 0.15s ease;
        }
        .skip-link:focus { transform: translateY(0); }

        /* ── FOCUS VISIBLE ── */
        :focus-visible {
          outline: 2px solid var(--fg);
          outline-offset: 3px;
        }

        /* ── SR-ONLY UTILITY ── */
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .cursor { transition: none !important; }
          .cursor-ring { transition: transform 0.10s linear !important; }
          .footer-ghost, .footer-line1, .footer-line2 { transform: none !important; }
          .float-img, .interstitial { display: none; }
        }

        [data-theme] {
          background: var(--bg);
          color: var(--fg);
          transition: background-color 0.45s ease, color 0.45s ease;
          min-height: 100vh;
        }

        /* ── NOISE ── */
        .noise { position: fixed; inset: 0; z-index: 200; pointer-events: none; opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px; }

        /* ── CURSOR ── */
        .cursor {
          position: fixed;
          width: 12px; height: 12px;
          background: var(--fg);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          top: 0; left: 0;
          transform: translate(-6px, -6px);
          will-change: transform;
        }
        .cursor-ring {
          position: fixed;
          width: 40px; height: 40px;
          border: 1px solid rgba(128,128,128,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          mix-blend-mode: difference;
          top: 0; left: 0;
          transform: translate(-20px, -20px);
          transition: transform 0.10s linear;
          will-change: transform;
        }

        /* ── THEME TOGGLE ── */
        .theme-toggle { position: fixed; bottom: 36px; right: 36px; z-index: 500; display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: var(--toggle-bg); color: var(--toggle-fg); border: 1px solid var(--toggle-border); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; cursor: none; transition: background 0.45s ease, color 0.45s ease, border-color 0.45s ease, transform 0.2s ease; }
        .theme-toggle:hover { transform: scale(1.04); }
        .toggle-icon { font-size: 14px; line-height: 1; transition: transform 0.4s ease; }
        .theme-toggle:hover .toggle-icon { transform: rotate(30deg); }

        /* ── NAV ── */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 24px 48px; }
        .nav-logo { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.15em; color: var(--fg); text-decoration: none; transition: color 0.45s ease; }
        .nav-right { display: flex; align-items: center; gap: 32px; }
        .nav-back { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; color: var(--fg); text-decoration: none; text-transform: uppercase; opacity: 0.55; transition: opacity 0.2s ease, color 0.45s ease; display: flex; align-items: center; gap: 8px; cursor: none; }
        .nav-back:hover { opacity: 1; }

        /* ── PAGE HEADER ── */
        .page-header {
          padding: 160px 48px 0;
          position: relative;
          overflow: hidden;
          min-height: 52vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 64px;
        }
        .page-header-ghost {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-display);
          font-size: clamp(160px, 22vw, 340px);
          color: transparent; -webkit-text-stroke: 1px var(--hero-ghost);
          white-space: nowrap; pointer-events: none; user-select: none;
          letter-spacing: -0.02em; z-index: 0;
        }
        .page-header-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(var(--muted) 1px, transparent 1px), linear-gradient(90deg, var(--muted) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          transition: background-image 0.45s ease;
        }
        .page-header-content { position: relative; z-index: 1; }
        .page-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase; margin-bottom: 20px; transition: color 0.45s ease; }
        .page-title { font-family: var(--font-display); font-size: clamp(72px, 12vw, 180px); line-height: 0.88; letter-spacing: -0.01em; text-transform: uppercase; color: var(--fg); transition: color 0.45s ease; }
        .page-title .outline { -webkit-text-stroke: 1.5px var(--fg); color: transparent; }
        .page-subtitle { font-family: var(--font-mono); font-size: 13px; line-height: 1.8; color: var(--gray); max-width: 440px; margin-top: 24px; transition: color 0.45s ease; }

        /* ── FILTER BAR ── */
        .filter-section { padding: 64px 48px 0; position: relative; }
        .filter-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.35em; color: var(--gray); text-transform: uppercase; margin-bottom: 24px; transition: color 0.45s ease; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; padding: 10px 20px;
          background: var(--chip-bg); color: var(--chip-fg);
          border: 1px solid var(--chip-border);
          cursor: none;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
          user-select: none;
        }
        .chip:hover { border-color: var(--fg); color: var(--fg); transform: translateY(-1px); }
        .chip.active { background: var(--chip-active-bg); color: var(--chip-active-fg); border-color: var(--chip-active-bg); }

        /* ── FILTER STATUS BAR ── */
        .filter-status {
          display: flex; justify-content: space-between; align-items: center;
          padding: 32px 48px 0;
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em;
          color: var(--gray); text-transform: uppercase;
          transition: color 0.45s ease;
          border-bottom: 1px solid var(--section-border);
          padding-bottom: 20px;
          margin-top: 40px;
          opacity: 0;
          transition: opacity 0.4s ease, color 0.45s ease, border-color 0.45s ease;
        }
        .filter-status.visible { opacity: 1; }
        .filter-active-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-active-tag { padding: 4px 10px; border: 1px solid var(--section-border); font-size: 9px; letter-spacing: 0.2em; color: var(--gray); }

        /* ── PROMPT (shown before any selection) ── */
        .select-prompt {
          padding: 120px 48px;
          text-align: center;
          transition: opacity 0.4s ease;
        }
        .select-prompt-inner { display: inline-block; }
        .select-prompt-icon { font-size: 48px; margin-bottom: 24px; opacity: 0.2; display: block; }
        .select-prompt-text {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 56px);
          letter-spacing: 0.02em;
          color: var(--fg);
          opacity: 0.15;
          text-transform: uppercase;
          display: block;
          margin-bottom: 12px;
          transition: color 0.45s ease;
        }
        .select-prompt-sub {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.25em;
          color: var(--gray);
          text-transform: uppercase;
          opacity: 0.6;
          transition: color 0.45s ease;
        }

        /* ── PORTFOLIO GRID ── */
        .portfolio-grid {
          padding: 0 48px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        /* ── PIECE CARD ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .piece-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          overflow: hidden;
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
          transition: background 0.45s ease, border-color 0.45s ease;
          cursor: none;
        }
        .piece-card:hover .slide-placeholder { filter: brightness(1.04); }

        /* ── SLIDESHOW ── */
        .slideshow { position: relative; }
        .slide-viewport {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--img-bg);
          transition: background 0.45s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slide-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          transition: filter 0.3s ease, background 0.45s ease;
        }
        .slide-label { font-family: var(--font-display); font-size: clamp(22px, 3vw, 40px); letter-spacing: 0.06em; color: var(--img-label); text-transform: uppercase; text-align: center; padding: 0 24px; transition: color 0.45s ease; }
        .slide-count { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.3em; color: var(--img-hint); transition: color 0.45s ease; }
        .slide-hint { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.15em; color: var(--img-hint); text-transform: uppercase; transition: color 0.45s ease; }

        .slide-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--fg);
          font-family: var(--font-mono); font-size: 18px;
          cursor: none; padding: 12px 16px; opacity: 0;
          transition: opacity 0.25s ease, color 0.45s ease;
          z-index: 3;
        }
        .slide-viewport:hover .slide-arrow { opacity: 0.6; }
        .slide-arrow:hover { opacity: 1 !important; }
        .slide-arrow-prev { left: 0; }
        .slide-arrow-next { right: 0; }

        .slide-dots { display: flex; gap: 6px; padding: 12px 16px; justify-content: center; }
        .slide-dot { width: 5px; height: 5px; border-radius: 50%; border: none; background: var(--section-border); cursor: none; padding: 0; transition: background 0.2s ease, transform 0.2s ease; }
        .slide-dot-active { background: var(--fg); transform: scale(1.4); }

        /* ── PIECE META ── */
        .piece-meta { padding: 28px 32px 36px; }
        .piece-meta-top {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 14px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 14px;
          transition: border-color 0.45s ease;
        }
        .piece-id { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.3em; color: var(--gray); transition: color 0.45s ease; }
        .piece-cat-tag { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em; color: var(--chip-fg); text-transform: uppercase; border: 1px solid var(--chip-border); padding: 3px 8px; transition: color 0.45s ease, border-color 0.45s ease; }
        .piece-date { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--gray); margin-left: auto; transition: color 0.45s ease; }
        .piece-title { font-family: var(--font-title); font-size: clamp(28px, 3.5vw, 48px); letter-spacing: 0.02em; color: var(--fg); line-height: 1; margin-bottom: 14px; text-transform: uppercase; transition: color 0.45s ease; }
        .piece-desc {
          font-family: var(--font-mono); font-size: 12px; line-height: 1.9; color: var(--gray); transition: color 0.45s ease;
          max-height: calc(1.9em * 3);
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        /* ── SLIDESHOW — CLICKABLE STATE ── */
        .slide-viewport-clickable { cursor: none; }
        .slide-viewport-clickable:hover .slide-placeholder { filter: brightness(1.06); }
        .slide-expand-hint {
          position: absolute; bottom: 10px; right: 12px;
          font-size: 16px; color: var(--fg); opacity: 0;
          transition: opacity 0.2s ease; pointer-events: none;
          line-height: 1;
        }
        .slide-viewport-clickable:hover .slide-expand-hint { opacity: 0.45; }

        /* ── LIGHTBOX ── */
        .lb-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: var(--bg);
          pointer-events: all;
        }
        .lb-image-area {
          position: fixed;
          top: 0; left: 0;
          width: 72vw; height: 100vh;
          z-index: 1001;
          overflow: hidden;
          background: var(--img-bg);
          transform-origin: center center;
          will-change: transform;
        }
        .lb-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .lb-image-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          background: var(--img-bg);
        }
        .lb-image-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 5vw, 80px);
          letter-spacing: 0.06em; color: var(--img-label);
          text-transform: uppercase; text-align: center; padding: 0 48px;
        }
        .lb-image-num { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.3em; color: var(--img-hint); }
        .lb-image-hint { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--img-hint); text-transform: uppercase; }

        .lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: none; border: none;
          font-family: var(--font-mono); font-size: 28px;
          color: var(--fg); opacity: 0.35;
          cursor: none; padding: 24px 32px; z-index: 2;
          transition: opacity 0.2s ease, color 0.45s ease;
        }
        .lb-arrow:hover { opacity: 1; }
        .lb-arrow-prev { left: 0; }
        .lb-arrow-next { right: 0; }

        .lb-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 32px;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%);
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          pointer-events: none; z-index: 3;
          animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        [data-theme="light"] .lb-caption {
          background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%);
        }

        /* ── SIDE PANEL ── */
        .lb-side-panel {
          position: fixed;
          top: 0; right: 0;
          width: 28vw; min-width: 280px; max-width: 400px;
          height: 100vh;
          display: flex; flex-direction: column;
          padding: 28px 32px 32px;
          z-index: 1002;
          border-left: 1px solid var(--section-border);
          background: var(--bg);
          overflow-y: auto;
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.36s ease, transform 0.48s cubic-bezier(0.16,1,0.3,1), background 0.45s ease, border-color 0.45s ease;
          pointer-events: none;
        }
        .lb-side-panel-visible { opacity: 1; transform: translateX(0); pointer-events: all; }
        .lb-side-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; flex-shrink: 0; }
        .lb-back { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg); background: none; border: none; cursor: none; opacity: 0.7; padding: 0; transition: opacity 0.2s ease, color 0.45s ease; }
        .lb-back:hover { opacity: 1; }
        .lb-top-counter { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.25em; color: var(--gray); transition: color 0.45s ease; }
        .lb-side-body { flex: 1; display: flex; flex-direction: column; }
        .lb-side-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .lb-top-id { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.3em; color: var(--gray); transition: color 0.45s ease; }
        .lb-top-date { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--gray); transition: color 0.45s ease; }
        .lb-side-title { font-family: var(--font-title); font-size: clamp(28px, 2.4vw, 44px); letter-spacing: 0.02em; color: var(--fg); line-height: 1; text-transform: uppercase; margin-bottom: 20px; transition: color 0.45s ease; }
        .lb-cats { display: flex; gap: 8px; flex-wrap: wrap; }
        .lb-cats-side { margin-bottom: 0; }
        .lb-cat { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--section-border); padding: 4px 10px; transition: color 0.45s ease, border-color 0.45s ease; }
        .lb-side-divider { width: 100%; height: 1px; background: var(--section-border); margin: 28px 0; flex-shrink: 0; transition: background 0.45s ease; }
        .lb-desc { font-family: var(--font-mono); font-size: 11px; line-height: 1.8; color: var(--gray); transition: color 0.45s ease; }
        .lb-side-dots { display: flex; gap: 8px; align-items: center; margin-top: 32px; flex-shrink: 0; }
        .lb-dot { width: 6px; height: 6px; border-radius: 50%; border: none; background: var(--section-border); cursor: none; padding: 0; transition: background 0.2s ease, transform 0.2s ease; }
        .lb-dot-active { background: var(--fg); transform: scale(1.5); }

        @media (max-width: 768px) {
          .lb-image-area { width: 100vw; height: 60vh; top: 0; }
          .lb-side-panel { top: auto; bottom: 0; right: 0; width: 100vw; max-width: 100%; height: 40vh; min-height: 200px; border-left: none; border-top: 1px solid var(--section-border); transform: translateY(40px); }
          .lb-side-panel-visible { transform: translateY(0); }
          .lb-arrow { font-size: 22px; padding: 16px 20px; }
          .lb-side-top { margin-bottom: 20px; }
        }

        /* ── FOOTER CTA ── */
        .footer-cta { padding: 140px 48px 80px; text-align: center; position: relative; overflow: visible; }
        .footer-cta-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase; margin-bottom: 32px; transition: color 0.45s ease; position: relative; z-index: 2; }
        .footer-line1 { font-family: var(--font-display); font-size: clamp(64px, 10vw, 160px); line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase; color: var(--fg); transition: color 0.45s ease; display: block; position: relative; z-index: 2; }
        .footer-line2 { font-family: var(--font-display); font-size: clamp(64px, 10vw, 160px); line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase; -webkit-text-stroke: 1.5px var(--fg); color: transparent; display: block; position: relative; z-index: 2; }
        .footer-ghost { position: absolute; top: 60px; left: 50%; transform: translateX(-50%); font-family: var(--font-display); font-size: clamp(200px, 28vw, 420px); color: transparent; -webkit-text-stroke: 1px var(--outline-stroke); white-space: nowrap; pointer-events: none; user-select: none; z-index: 0; will-change: transform; }
        .cta-buttons { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 64px; position: relative; z-index: 2; flex-wrap: wrap; }
        .cta-button { display: inline-flex; align-items: center; gap: 16px; padding: 20px 48px; background: var(--btn-bg); color: var(--btn-fg); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; border: 1.5px solid var(--btn-bg); cursor: none; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        .cta-button:hover { background: transparent; color: var(--btn-hover-fg); border-color: var(--btn-hover-border); }
        .cta-arrow { display: inline-block; transition: transform 0.3s ease; }
        .cta-button:hover .cta-arrow { transform: translateX(6px); }
        .footer-bottom { margin-top: 80px; padding-top: 32px; border-top: 1px solid var(--section-border); display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--gray); text-transform: uppercase; transition: border-color 0.45s ease, color 0.45s ease; position: relative; z-index: 2; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-1 { animation-delay:0.10s; opacity:0; }
        .fade-up-2 { animation-delay:0.25s; opacity:0; }
        .fade-up-3 { animation-delay:0.40s; opacity:0; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .page-header { padding: 120px 24px 48px; }
          .filter-section { padding: 48px 24px 0; }
          .filter-status { padding: 24px 24px 16px; margin-top: 24px; }
          .portfolio-grid { padding: 0 24px 60px; grid-template-columns: 1fr; }
          .select-prompt { padding: 80px 24px; }
          .footer-cta { padding: 80px 24px 60px; }
          .footer-bottom { flex-direction: column; gap: 12px; }
          .theme-toggle { bottom: 20px; right: 20px; }
          .nav-right { gap: 16px; }
          .piece-meta { padding: 20px 20px 28px; }
        }
      `}</style>

      <div className="noise" aria-hidden="true" />
      <div className="cursor"      ref={dotRef}  aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <span className="toggle-icon" aria-hidden="true">{isDark ? "○" : "●"}</span>
        <span>{isDark ? "LIGHT" : "DARK"}</span>
      </button>

      <nav aria-label="Main navigation">
        <a href="/" className="nav-logo" aria-label="Aidan Schreder — home">AS</a>
        <div className="nav-right">
          <a href="/" className="nav-back">← Back</a>
        </div>
      </nav>

      <main id="main-content">

      <header className="page-header">
        <div className="page-header-grid" aria-hidden="true" />
        <div className="page-header-ghost" aria-hidden="true">WORK</div>
        <div className="page-header-content">
          <p className="page-eyebrow fade-up fade-up-1">✦ Aidan Schreder — Selected Works</p>
          <h1 className="page-title fade-up fade-up-2">
            DESIGN<br /><span className="outline">PORTFOLIO</span>
          </h1>
          <p className="page-subtitle fade-up fade-up-3">
            A curated archive of design work across branding, spatial, digital, and print disciplines. Select one or more categories below to explore.
          </p>
        </div>
      </header>

      <section className="filter-section">
        <p className="filter-label">Filter by discipline — select one</p>
        <div className="filter-chips" role="group" aria-label="Filter categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip${selected === cat ? " active" : ""}`}
              onClick={() => selectCategory(cat)}
              aria-pressed={selected === cat}
            >
              {cat}
            </button>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {showGrid ? `${filtered.length} piece${filtered.length !== 1 ? "s" : ""} shown for ${selected}` : ""}
        </div>
      </section>

      <div className={`filter-status${showGrid ? " visible" : ""}`} style={{ padding: "32px 48px 20px" }}>
        <span className="filter-active-tag">{selected}</span>
        <span>{filtered.length} piece{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {!hasEverSelected && (
        <div className="select-prompt">
          <div className="select-prompt-inner">
            <span className="select-prompt-icon">✦</span>
            <span className="select-prompt-text">Select a category</span>
            <span className="select-prompt-sub">to reveal work</span>
          </div>
        </div>
      )}

      {showGrid && filtered.length > 0 && (
        <div className="portfolio-grid">
          {filtered.map((piece, i) => (
            <PieceCard key={piece.id} piece={piece} index={i} isActive={lightbox?.piece.id === piece.id} onOpen={openLightbox} />
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox state={lightbox} onClose={closeLightbox} isDark={isDark} />
      )}

      {showEmpty && (
        <div className="select-prompt">
          <div className="select-prompt-inner">
            <span className="select-prompt-icon">○</span>
            <span className="select-prompt-text">No pieces found</span>
            <span className="select-prompt-sub">Try another category</span>
          </div>
        </div>
      )}

      <section className="footer-cta" ref={footerRef}>
        <div className="footer-ghost" style={{ transform: `translateX(-50%) translateY(${ftScroll * 0.28}px)` }} aria-hidden="true">
          CTA
        </div>

        <p className="footer-cta-label">Let&apos;s Work Together</p>

        <span className="footer-line1" style={{ transform: `translateY(${ftScroll * 0.01}px)` }} aria-hidden="true">
          START A
        </span>
        <span className="footer-line2" style={{ transform: `translateY(${ftScroll * -0.01}px)` }} aria-hidden="true">
          PROJECT
        </span>

        <div className="cta-buttons">
          <a
            href="mailto:aidan.schreder@gmail.com"
            className="cta-button"
            onClick={() => trackGA4Event("contact_click", { source: "portfolio_cta" })}
          >
            Request Design Services <span className="cta-arrow">→</span>
          </a>
        </div>

        <div className="footer-bottom">
          <span>© {themeConfig.copyrightYear} {themeConfig.copyrightName}</span>
          <span>Design Portfolio</span>
          <span>Available for Freelance</span>
          <span style={{ opacity: 0.45 }}>Updated {LAST_UPDATED}</span>
        </div>
      </section>
      </main>
    </div>
  );
}