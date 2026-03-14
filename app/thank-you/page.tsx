"use client";

import { useEffect } from "react";
import { SpaceMono, fontConfig } from "../fonts.config";
import { themeConfig, homeDarkVars, homeLightVars } from "../theme.config";
import { useTheme } from "../components/ThemeProvider";
import { useFastCursor } from "../components/useFastCursor";

export default function ThankYouPage() {
  const { isDark, setIsDark } = useTheme();
  const { dotRef, ringRef }   = useFastCursor();

  // Attempt to open the mail client on arrival, so users who navigated here
  // from the contact button still get the mailto prompt.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "mailto:aidan.schreder@gmail.com";
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Sync Safari/Chrome mobile UI chrome colour with current theme.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const themeEl = document.querySelector("[data-theme]");
      if (!themeEl) return;
      const bg = getComputedStyle(themeEl).getPropertyValue("--bg").trim();
      if (!bg) return;
      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = bg;
    });
    return () => cancelAnimationFrame(raf);
  }, [isDark]);

  return (
    <div
      className={SpaceMono.variable}
      data-theme={isDark ? "dark" : "light"}
      style={{ width: "100%", overflowX: "hidden" }}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      <style>{`
        ${fontConfig.fontFace ?? ""}

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        h1, h2, h3, h4, h5, h6 { font-weight: 400; }

        :root {
          --font-display: ${fontConfig.display};
          --font-title:   ${fontConfig.title};
          --font-mono:    ${fontConfig.mono};
        }

        [data-theme="dark"]  { ${homeDarkVars()}  }
        [data-theme="light"] { ${homeLightVars()} }

        html { scroll-behavior: smooth; overflow-x: hidden; max-width: 100%; }
        body { font-family: var(--font-mono); overflow-x: hidden; max-width: 100%; cursor: none; }

        @media (pointer: fine) {
          .theme-toggle, .back-btn { cursor: none; }
        }

        @media (pointer: coarse) {
          body { cursor: auto; }
          .theme-toggle, .back-btn { cursor: auto; }
          .cursor, .cursor-ring { display: none; }
          html, body { overscroll-behavior: none; }
        }

        [data-theme] {
          background: var(--bg);
          color: var(--fg);
          transition: background-color 0.45s ease, color 0.45s ease;
          min-height: 100vh;
        }

        /* ── NOISE ── */
        .noise {
          position: fixed; inset: 0; z-index: 200; pointer-events: none;
          opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ── CURSOR ── */
        .cursor {
          position: fixed; width: 12px; height: 12px;
          background: var(--fg); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          top: 0; left: 0; transform: translate(-6px, -6px);
          will-change: transform;
        }
        .cursor-ring {
          position: fixed; width: 40px; height: 40px;
          border: 1px solid rgba(128,128,128,0.5); border-radius: 50%;
          pointer-events: none; z-index: 9998; mix-blend-mode: difference;
          top: 0; left: 0; transform: translate(-20px, -20px);
          transition: transform 0.10s linear; will-change: transform;
        }

        /* ── THEME TOGGLE ── */
        .theme-toggle {
          position: fixed; bottom: 36px; right: 36px; z-index: 500;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px;
          background: var(--toggle-bg); color: var(--toggle-fg);
          border: 1px solid var(--toggle-border);
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.25em; text-transform: uppercase; cursor: none;
          transition: background 0.45s ease, color 0.45s ease,
                      border-color 0.45s ease, transform 0.2s ease;
        }
        .theme-toggle:hover { transform: scale(1.04); }
        .toggle-icon { font-size: 14px; line-height: 1; transition: transform 0.4s ease; }
        .theme-toggle:hover .toggle-icon { transform: rotate(30deg); }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 48px;
        }
        .nav-logo {
          font-family: var(--font-display); font-size: 20px;
          letter-spacing: 0.15em; color: var(--fg); text-decoration: none;
          transition: color 0.45s ease;
        }

        /* ── SKIP LINK ── */
        .skip-link {
          position: absolute; top: 0; left: 16px; z-index: 10000;
          padding: 12px 20px; background: var(--fg); color: var(--bg);
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;
          transform: translateY(-100%); transition: transform 0.15s ease;
        }
        .skip-link:focus { transform: translateY(0); }

        :focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        /* ── PAGE LAYOUT ── */
        .ty-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 48px 80px;
          overflow: hidden;
        }

        /* ── GRID OVERLAY (matches hero) ── */
        .ty-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--muted) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          transition: background-image 0.45s ease;
        }

        /* ── GHOST TEXT ── */
        .ty-ghost {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-display);
          font-size: clamp(180px, 26vw, 400px);
          color: transparent;
          -webkit-text-stroke: 1px var(--hero-ghost);
          white-space: nowrap;
          pointer-events: none; user-select: none;
          letter-spacing: -0.02em;
          z-index: 0;
        }

        /* ── DECO LINE (matches hero) ── */
        .ty-deco-line {
          position: absolute; top: 42%; left: 0; right: 0;
          height: 1px; background: var(--deco-line);
          pointer-events: none; z-index: 1;
          transition: background 0.45s ease;
        }

        /* ── CONTENT ── */
        .ty-content {
          position: relative; z-index: 2;
          max-width: 900px;
        }

        .ty-eyebrow {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase;
          margin-bottom: 24px;
          transition: color 0.45s ease;
        }

        .ty-heading {
          font-family: var(--font-display);
          font-size: clamp(72px, 13vw, 200px);
          line-height: 0.88; letter-spacing: -0.01em;
          text-transform: uppercase;
          color: var(--fg);
          transition: color 0.45s ease;
          margin-bottom: 48px;
        }
        .ty-heading .outline {
          -webkit-text-stroke: 1.5px var(--fg);
          color: transparent;
        }

        /* ── BODY BLOCK ── */
        .ty-body {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-top: 1px solid var(--section-border);
          padding-top: 40px;
          transition: border-color 0.45s ease;
        }

        .ty-message {
          font-family: var(--font-mono); font-size: 14px; line-height: 2;
          color: var(--gray); max-width: 480px;
          margin-bottom: 12px;
          transition: color 0.45s ease;
        }

        .ty-email-label {
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase;
          margin-bottom: 8px; margin-top: 32px;
          transition: color 0.45s ease;
        }

        .ty-email {
          font-family: var(--font-mono); font-size: 13px;
          letter-spacing: 0.08em; color: var(--fg);
          text-decoration: none;
          border-bottom: 1px solid var(--section-border);
          padding-bottom: 2px;
          display: inline-block;
          transition: color 0.45s ease, border-color 0.2s ease;
        }
        .ty-email:hover { border-color: var(--fg); }

        /* ── BUTTONS ── */
        .ty-buttons {
          display: flex; align-items: center; gap: 16px;
          margin-top: 48px; flex-wrap: wrap;
        }

        .back-btn {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 18px 40px;
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.25em; text-transform: uppercase;
          text-decoration: none; border: 1.5px solid var(--section-border);
          color: var(--fg); background: transparent; cursor: none;
          transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .back-btn:hover { border-color: var(--fg); }
        .back-btn-filled {
          background: var(--btn-bg); color: var(--btn-fg);
          border-color: var(--btn-bg);
        }
        .back-btn-filled:hover {
          background: transparent; color: var(--btn-hover-fg);
          border-color: var(--btn-hover-border);
        }
        .btn-arrow { display: inline-block; transition: transform 0.3s ease; }
        .back-btn:hover .btn-arrow { transform: translateX(-4px); }

        /* ── FOOTER STRIP ── */
        .ty-footer {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 24px 48px;
          border-top: 1px solid var(--section-border);
          display: flex; justify-content: space-between;
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.2em; color: var(--gray); text-transform: uppercase;
          transition: border-color 0.45s ease, color 0.45s ease;
          z-index: 2;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-1 { animation-delay: 0.10s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.40s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.55s; opacity: 0; }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .cursor { transition: none !important; }
          .cursor-ring { transition: transform 0.10s linear !important; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .ty-page { padding: 100px 24px 100px; }
          .ty-footer { padding: 20px 24px; flex-direction: column; gap: 8px; }
          .ty-buttons { flex-direction: column; align-items: flex-start; }
          .back-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── NOISE ── */}
      <div className="noise" aria-hidden="true" />

      {/* ── CURSOR ── */}
      <div className="cursor"      ref={dotRef}  aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      {/* ── THEME TOGGLE ── */}
      <button
        className="theme-toggle"
        onClick={() => setIsDark(d => !d)}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="toggle-icon" aria-hidden="true">{isDark ? "○" : "●"}</span>
        <span>{isDark ? "LIGHT" : "DARK"}</span>
      </button>

      {/* ── NAV ── */}
      <nav aria-label="Main navigation">
        <a href="/" className="nav-logo" aria-label="Aidan Schreder — home">AS</a>
      </nav>

      {/* ── MAIN ── */}
      <main id="main-content">
        <div className="ty-page">
          <div className="ty-grid" aria-hidden="true" />
          <div className="ty-ghost" aria-hidden="true">THANKS</div>
          <div className="ty-deco-line" aria-hidden="true" />

          <div className="ty-content">
            <p className="ty-eyebrow fade-up fade-up-1">✦ Aidan Schreder — Contact</p>

            <h1 className="ty-heading fade-up fade-up-2">
              THANK<br /><span className="outline">YOU</span>
            </h1>

            <div className="ty-body fade-up fade-up-3">
              <p className="ty-message">
                Your message means a lot. If your email client didn&apos;t open automatically,
                you can reach me directly at the address below — I&apos;ll get back to you
                as soon as I can.
              </p>

              <p className="ty-email-label">Direct email</p>
              <a
                href="mailto:aidan.schreder@gmail.com"
                className="ty-email"
                aria-label="Send email to aidan.schreder@gmail.com"
              >
                aidan.schreder@gmail.com
              </a>

              <div className="ty-buttons fade-up fade-up-4">
                <a href="/" className="back-btn back-btn-filled">
                  <span className="btn-arrow">←</span> Back to Home
                </a>
                <a href="/portfolio" className="back-btn">
                  <span className="btn-arrow">←</span> Back to Portfolio
                </a>
              </div>
            </div>
          </div>

          <footer className="ty-footer" aria-label="Page footer">
            <span>© {themeConfig.copyrightYear} {themeConfig.copyrightName}</span>
            <span>Website built using Next.js, React, Vercel, and Node.js</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
