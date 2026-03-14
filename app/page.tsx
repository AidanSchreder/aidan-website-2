"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SpaceMono } from "./fonts.config";
import { fontConfig } from "./fonts.config";
import { themeConfig, homeDarkVars, homeLightVars } from "./theme.config";
import { ENGINEERING_PROJECTS, LAST_UPDATED } from "./content.config";
import { useTheme } from "./components/ThemeProvider";
import { useFastCursor } from "./components/useFastCursor";
import { trackGA4Event } from "./components/GoogleAnalytics";

// ── DYNAMIC IMPORTS ───────────────────────────────────────────────────────────
// FloatModel: dynamically imported so Three.js (~600kb) is excluded from the
// initial bundle. It loads after the page is interactive — correct behaviour
// since the 3D models are decorative parallax elements, not critical content.
//
// FloatImg: dynamically imported to keep the initial bundle lean and allow
// next/image optimisation (WebP/AVIF conversion, lazy loading, srcset).
//
// ssr: false is required for both — they use browser-only APIs (WebGL,
// ResizeObserver, pointer events) that cannot run on the server.

const FloatModel = dynamic(() => import("./components/FloatModel"), { ssr: false });
const FloatImg   = dynamic(() => import("./components/FloatImg"),   { ssr: false });

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
// Device classes drive conditional rendering of FloatImg / FloatModel.
// Resolved client-side only (inside useEffect) to avoid SSR/hydration mismatches.
// "pc"     → fine pointer (mouse/trackpad): all floats shown
// "tablet" → coarse pointer + wide screen (≥768 px): images only, no models
// "phone"  → coarse pointer + narrow screen (<768 px): no images, no models
type DeviceClass = "pc" | "tablet" | "phone";

export default function Portfolio() {
  const [scrollY, setScrollY]                       = useState(0);
  // null = not yet resolved (first render / SSR). Floats are suppressed until
  // this is set, preventing a flash of incorrectly-shown content on mobile.
  const [deviceClass, setDeviceClass]               = useState<DeviceClass | null>(null);
  const { isDark, setIsDark }                       = useTheme();
  const { dotRef, ringRef }                         = useFastCursor();

  const heroRef        = useRef<HTMLElement>(null);
  const aboutRef       = useRef<HTMLElement>(null);
  const engineeringRef = useRef<HTMLElement>(null);
  const footerRef      = useRef<HTMLElement>(null);

  // Resolve device class once on mount (client only).
  // getDeviceClass is defined here — inside the effect scope — so it is
  // guaranteed to only ever run in a browser context where window exists.
  // Also re-evaluates on resize to handle device rotation correctly.
  useEffect(() => {
    function getDeviceClass(): DeviceClass {
      if (window.matchMedia("(pointer: coarse) and (max-width: 767px)").matches) return "phone";
      if (window.matchMedia("(pointer: coarse)").matches) return "tablet";
      return "pc";
    }
    const update = () => setDeviceClass(getDeviceClass());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  // Sync Safari/Chrome mobile UI chrome colour (status bar, tab bar) with the
  // current theme. --bg is defined on [data-theme] (a child div), NOT on :root,
  // so we must query that element — not document.documentElement — to get the
  // resolved value. rAF ensures the attribute has been committed to the DOM
  // before we read the computed style.
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

  const relScroll = (ref: React.RefObject<HTMLElement | null>) =>
    ref.current ? scrollY - ref.current.offsetTop : 0;

  const heroScroll  = relScroll(heroRef);
  const aboutScroll = relScroll(aboutRef);
  const engScroll   = relScroll(engineeringRef);
  const ftScroll    = relScroll(footerRef);

  const engineeringProjects = ENGINEERING_PROJECTS;

  // Derived visibility flags from deviceClass.
  // null (unresolved) → hide all floats to prevent flash on mobile.
  // PC: both shown. Tablet: images only, no models. Phone: neither.
  const showImgs   = deviceClass === "pc" || deviceClass === "tablet";
  const showModels = deviceClass === "pc";

  return (
    <div className={SpaceMono.variable} data-theme={isDark ? "dark" : "light"} style={{ width: "100%" }}>
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

        [data-theme="dark"] {
          ${homeDarkVars()}
        }

        [data-theme="light"] {
          ${homeLightVars()}
        }

        html { scroll-behavior: smooth; overflow-x: hidden; max-width: 100%; }
        body { font-family: var(--font-mono); cursor: none; }

        @media (pointer: fine) {
          .theme-toggle, .cta-button, .cta-button-outline,
          .nav-links a, .eng-item { cursor: none; }
        }

        [data-theme] {
          background: var(--bg);
          color: var(--fg);
          transition: background-color 0.45s ease, color 0.45s ease;
          min-height: 100vh;
        }

        /* ── FLOATING IMAGE PLACEHOLDERS ── */
        .float-img {
          pointer-events: none;
        }
        .float-img-inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: visible;
          transform: scale(1);
          transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .float-img-inner-hovered {
          transform: scale(1.08);
        }
        .float-img-hover-wrap {
          width: 100%;
          height: 100%;
          pointer-events: none;
          position: relative;
          filter: grayscale(100%);
          transition: filter 0.45s ease;
          overflow: hidden;
        }
        .float-img-hover-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-color: rgba(0, 0, 0, 0.60);
          opacity: 1;
          transition: opacity 0.45s ease, background-color 0.45s ease;
        }
        [data-theme="light"] .float-img-hover-wrap::after {
          background-color: rgba(255, 255, 255, 0.75);
        }
        [data-theme="dark"] .float-img-hover-wrap::after {
          background-color: rgba(0, 0, 0, 0.60);
        }
        .float-img-hovered {
          filter: grayscale(0%);
        }
        .float-img-hovered::after {
          opacity: 0 !important;
        }
        .float-img-placeholder {
          width: 100%;
          height: 100%;
          background: var(--img-bg);
          border: 1px solid var(--img-border);
          box-shadow: 6px 8px 32px var(--img-shadow);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
        }
        .float-img-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.25em;
          color: var(--img-label);
          text-transform: uppercase;
          transition: color 0.45s ease;
        }
        .float-img-hint {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--img-hint);
          text-transform: uppercase;
          transition: color 0.45s ease;
        }

        /* ── REGISTRATION MARKS ── */
        .float-img-marks polyline {
          fill: none;
          stroke: var(--gray);
          stroke-width: 1;
          opacity: 0.45;
          transition: opacity 0.45s ease, stroke 0.45s ease;
        }
        .float-img-marks-hovered polyline {
          opacity: 0.9;
          stroke: var(--fg);
        }

        /* ── METADATA LABEL ── */
        .float-img-meta {
          position: absolute;
          bottom: -22px;
          left: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 0.4;
          transition: opacity 0.45s ease;
          white-space: nowrap;
          pointer-events: none;
        }
        .float-img-meta-hovered {
          opacity: 0.85;
        }
        .float-img-meta-label,
        .float-img-meta-sep,
        .float-img-meta-dims {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gray);
          transition: color 0.45s ease;
        }
        .float-img-meta-hovered .float-img-meta-label,
        .float-img-meta-hovered .float-img-meta-sep,
        .float-img-meta-hovered .float-img-meta-dims {
          color: var(--fg);
        }

        /* ── FLOAT MODEL WRAPPER ── */
        /* Zero-size, non-positioned wrapper. Adds no layout space and does not
           create a new stacking or positioning context, so FloatModel's own
           position: absolute continues to resolve against its section ancestor.
           Using display: block (not display: contents) is intentional — Safari
           has a bug where display: none cannot override display: contents,
           which would break the PC portrait hide rule below. */
        .float-model-wrap {
          display: block;
          width: 0;
          height: 0;
          overflow: visible;
        }

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

        /* ── HIDE CUSTOM CURSOR ON TOUCH/MOBILE DEVICES ── */
        /* pointer: coarse = touchscreen (phone, tablet).        */
        /* pointer: fine   = mouse/trackpad (PC, even portrait). */
        @media (pointer: coarse) {
          body { cursor: auto; }
          .theme-toggle, .cta-button, .cta-button-outline,
          .nav-links a, .eng-item { cursor: auto; }
          .cursor, .cursor-ring { display: none; }
          /* Prevent rubber-band/bounce overscroll revealing white browser chrome.
             Horizontal is fully locked; vertical bounce at page top/bottom removed.
             Applied only on touch devices — PC trackpad momentum scroll unaffected. */
          html, body { overscroll-behavior: none; }
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
        .nav-links { display: flex; gap: 40px; list-style: none; }
        .nav-links a {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.2em; color: var(--fg); text-decoration: none;
          text-transform: uppercase; opacity: 0.55;
          transition: opacity 0.2s ease, color 0.45s ease;
        }

        .nav-links a:hover { opacity: 1; }

        /* ── HERO ── */
        .hero {
          position: relative; height: 100vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 48px 64px; overflow: hidden;
        }
        .hero-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--muted) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          transition: background-image 0.45s ease;
        }
        .hero-bg-text {
          position: absolute; top: 50%; left: 50%;
          font-family: var(--font-display); font-size: clamp(200px, 28vw, 420px);
          color: transparent; -webkit-text-stroke: 1px var(--hero-ghost);
          white-space: nowrap; pointer-events: none; user-select: none;
          letter-spacing: -0.02em; z-index: 1;
        }
        .hero-deco-line {
          position: absolute; top: 38%; left: 0; right: 0;
          height: 1px; background: var(--deco-line);
          pointer-events: none; z-index: 2;
          transition: background 0.45s ease;
        }
        .hero-content { position: relative; z-index: 3; }
        .hero-eyebrow {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase;
          margin-bottom: 16px; transition: color 0.45s ease;
        }
        .hero-name {
          font-family: var(--font-display); font-size: clamp(80px, 13vw, 200px);
          line-height: 0.88; letter-spacing: -0.01em; text-transform: uppercase;
          color: var(--fg); will-change: transform; transition: color 0.45s ease;
        }
        .hero-name .outline { -webkit-text-stroke: 1.5px var(--fg); color: transparent; }
        .hero-subtitle {
          font-family: var(--font-mono); font-size: clamp(13px, 1.4vw, 18px);
          letter-spacing: 0.3em; color: var(--fg); text-transform: uppercase;
          margin-top: 20px; font-weight: 700; opacity: 0.85;
          transition: color 0.45s ease;
        }
        .hero-bottom {
          position: relative; z-index: 3;
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-top: 32px;
        }
        .hero-tagline {
          font-family: var(--font-mono); font-size: 13px; line-height: 1.7;
          color: var(--gray); max-width: 280px; transition: color 0.45s ease;
        }
        .hero-scroll-indicator {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.3em;
          color: var(--gray); text-transform: uppercase; transition: color 0.45s ease;
        }
        .scroll-line {
          width: 1px; height: 60px;
          background: linear-gradient(to bottom, var(--fg), transparent);
          animation: scrollLine 2s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0%,100% { opacity:0.3; transform:scaleY(0.5); transform-origin:top; }
          50%      { opacity:1;   transform:scaleY(1); }
        }
        .hero-corner-tag {
          position: absolute; top: 50%; right: 48px; transform: translateY(-50%);
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em;
          color: var(--gray); text-transform: uppercase; writing-mode: vertical-rl;
          opacity: 0.5; z-index: 3; transition: color 0.45s ease;
        }

        /* ── INTERSTITIAL STRIP (between sections, images only) ── */
        .interstitial {
          position: relative;
          height: 360px;
          overflow: visible;
          pointer-events: none;
        }

        /* ── SECTION SHARED ── */
        .section { padding: 140px 48px; position: relative; overflow: visible; }
        .section-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 80px;
          border-bottom: 1px solid var(--section-border); padding-bottom: 24px;
          transition: border-color 0.45s ease; position: relative; z-index: 2;
        }
        .section-number {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.2em; color: var(--gray); transition: color 0.45s ease;
        }
        .section-title {
          font-family: var(--font-display); font-size: clamp(60px, 9vw, 130px);
          letter-spacing: -0.01em; line-height: 0.9; text-transform: uppercase;
          color: var(--fg); transition: color 0.45s ease; will-change: transform;
        }
        .section-meta {
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.2em; color: var(--gray); text-transform: uppercase;
          text-align: right; transition: color 0.45s ease;
        }
        .section-ghost {
          position: absolute; top: 80px; right: 32px;
          font-family: var(--font-display); font-size: clamp(180px, 24vw, 380px);
          color: transparent; -webkit-text-stroke: 1px var(--outline-stroke);
          pointer-events: none; user-select: none;
          line-height: 1; z-index: 0;
        }

        /* ── ABOUT ── */
        .about-section { padding: 140px 48px; position: relative; overflow: visible; }
        .about-bg-text {
          position: absolute; bottom: -60px; right: -20px;
          font-family: var(--font-display); font-size: clamp(160px, 22vw, 340px);
          color: transparent; -webkit-text-stroke: 1px var(--outline-stroke);
          user-select: none; pointer-events: none; line-height: 1;
          z-index: 0;
        }
        .about-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
          align-items: start; position: relative; z-index: 2;
        }
        .about-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase; margin-bottom: 40px; transition: color 0.45s ease; }
        .about-headline { font-family: var(--font-display); font-size: clamp(48px, 7vw, 100px); line-height: 0.92; letter-spacing: -0.01em; color: var(--fg); text-transform: uppercase; will-change: transform; transition: color 0.45s ease; }
        .about-headline .stroke { -webkit-text-stroke: 1.5px var(--fg); color: transparent; }
        .about-right { padding-top: 60px; will-change: transform; }
        .about-body { font-family: var(--font-mono); font-size: 14px; line-height: 2; color: var(--gray); margin-bottom: 48px; transition: color 0.45s ease; }
        .about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .stat-item { border-top: 1px solid var(--stat-border); padding-top: 20px; transition: border-color 0.45s ease; }
        .stat-number { font-family: var(--font-display); font-size: 52px; color: var(--fg); line-height: 1; transition: color 0.45s ease; }
        .stat-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--gray); text-transform: uppercase; margin-top: 4px; transition: color 0.45s ease; }

        /* ── ENGINEERING ── */
        .eng-list { margin-top: 16px; position: relative; z-index: 2; }
        .eng-item {
          border-top: 1px solid var(--section-border); padding: 40px 0;
          display: grid; grid-template-columns: 80px 1fr 1fr auto;
          gap: 40px; align-items: center; cursor: none;
          transition: background 0.3s ease, padding 0.3s ease, margin 0.3s ease, border-color 0.45s ease;
          will-change: transform;
        }
        .eng-item:last-child { border-bottom: 1px solid var(--section-border); }
        .eng-item:hover { background: var(--eng-hover-bg); padding-left: 20px; padding-right: 20px; margin: 0 -20px; }
        .eng-num { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; color: var(--gray); transition: color 0.45s ease; }
        .eng-title { font-family: var(--font-title); font-size: clamp(28px, 3.5vw, 48px); letter-spacing: 0.02em; color: var(--fg); line-height: 1; transition: color 0.45s ease; }
        .eng-desc { font-family: var(--font-mono); font-size: 12px; line-height: 1.8; color: var(--gray); transition: color 0.45s ease; }
        .eng-stack { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.15em; color: var(--gray); text-align: right; text-transform: uppercase; transition: color 0.45s ease; }

        /* ── FOOTER CTA ── */
        .footer-cta { padding: 140px 48px 80px; text-align: center; position: relative; overflow: visible; }
        .footer-cta-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.3em; color: var(--gray); text-transform: uppercase; margin-bottom: 32px; transition: color 0.45s ease; position: relative; z-index: 2; }
        .footer-line1 { font-family: var(--font-display); font-size: clamp(64px, 10vw, 160px); line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase; color: var(--fg); transition: color 0.45s ease; display: block; position: relative; z-index: 2; }
        .footer-line2 { font-family: var(--font-display); font-size: clamp(64px, 10vw, 160px); line-height: 0.88; letter-spacing: -0.02em; text-transform: uppercase; -webkit-text-stroke: 1.5px var(--fg); color: transparent; display: block; position: relative; z-index: 2; }
        .footer-ghost { position: absolute; top: 60px; left: 50%; transform: translateX(-50%); font-family: var(--font-display); font-size: clamp(200px, 28vw, 420px); color: transparent; -webkit-text-stroke: 1px var(--outline-stroke); white-space: nowrap; pointer-events: none; user-select: none; z-index: 0; }
        .cta-buttons { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 64px; position: relative; z-index: 2; flex-wrap: wrap; }
        .cta-button { display: inline-flex; align-items: center; gap: 16px; padding: 20px 48px; background: var(--btn-bg); color: var(--btn-fg); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; border: 1.5px solid var(--btn-bg); cursor: none; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        .cta-button:hover { background: transparent; color: var(--btn-hover-fg); border-color: var(--btn-hover-border); }
        .cta-button-outline { display: inline-flex; align-items: center; gap: 16px; padding: 20px 48px; background: transparent; color: var(--fg); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; border: 1.5px solid var(--section-border); cursor: none; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        .cta-button-outline:hover { border-color: var(--fg); }
        .cta-arrow { display: inline-block; transition: transform 0.3s ease; }
        .cta-button:hover .cta-arrow, .cta-button-outline:hover .cta-arrow { transform: translateX(6px); }
        .footer-bottom { margin-top: 80px; padding-top: 32px; border-top: 1px solid var(--section-border); display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--gray); text-transform: uppercase; transition: border-color 0.45s ease, color 0.45s ease; position: relative; z-index: 2; }

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
          .hero-bg-text, .hero-deco-line, .hero-grid-overlay,
          .hero-name, .hero-tagline, .about-bg-text, .about-headline,
          .about-right, .section-ghost, .footer-ghost,
          .footer-line1, .footer-line2 { transform: none !important; }
          .float-img, .interstitial { display: none; }
        }

        /* ── NOISE ── */
        .noise { position: fixed; inset: 0; z-index: 200; pointer-events: none; opacity: 0.022; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size: 200px 200px; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-1 { animation-delay:0.10s; opacity:0; }
        .fade-up-2 { animation-delay:0.25s; opacity:0; }
        .fade-up-3 { animation-delay:0.40s; opacity:0; }
        .fade-up-4 { animation-delay:0.55s; opacity:0; }

        svg { display: block; }

        /* ── RESPONSIVE ── */
        @media (max-aspect-ratio: 1/1) {
          nav { padding: 20px 24px; }
          .hero { padding: 0 24px 48px; }
          .section, .about-section, .footer-cta { padding: 80px 24px; }
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .eng-item { grid-template-columns: 1fr; gap: 12px; }
          .footer-bottom { flex-direction: column; gap: 12px; }
          .theme-toggle { bottom: 20px; right: 20px; }
          .section-ghost { display: none; }
          /* Scale hero name to always fit within the padded viewport.
             clamp floor drops from 80px to 9vw so "SCHREDER" (8 wide glyphs)
             never exceeds the available width (100vw - 48px padding). */
          .hero-name { font-size: clamp(9vw, 13vw, 200px); }
        }

        /* On PC (fine pointer) in portrait, hide floats — they are positioned
           for landscape and will overlap text in a tall/narrow window.
           Tablet and phone are already handled by React conditional rendering
           and are unaffected by this rule (they have pointer: coarse). */
        @media (pointer: fine) and (max-aspect-ratio: 1/1) {
          .float-img       { display: none; }
          .float-model-wrap { display: none; }
          .interstitial    { display: none; }
        }
      `}</style>

      {/* ── NOISE ── */}
      <div className="noise" aria-hidden="true" />

      {/* ── CURSOR ── */}
      <div className="cursor"      ref={dotRef}  aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      {/* ── THEME TOGGLE ── */}
      <button className="theme-toggle" onClick={() => setIsDark(d => !d)} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <span className="toggle-icon" aria-hidden="true">{isDark ? "○" : "●"}</span>
        <span>{isDark ? "LIGHT" : "DARK"}</span>
      </button>

      {/* ── NAV ── */}
      <nav aria-label="Main navigation">
        <a href="#" className="nav-logo" aria-label="Aidan Schreder — home">AS</a>
        <ul className="nav-links">
          <li><a href="#projects">Projects</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
        </ul>
      </nav>

      <main id="main-content">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef} aria-labelledby="hero-heading">
        <div className="hero-grid-overlay" style={{ transform: `translateY(${heroScroll * 0.03}px)` }} aria-hidden="true" />
        <div className="hero-bg-text"       style={{ transform: `translate(-50%, calc(-50% + ${heroScroll * 0.30}px))` }} aria-hidden="true">AIDAN</div>
        <div className="hero-deco-line"     style={{ transform: `translateY(${heroScroll * 0.12}px)` }} aria-hidden="true" />

        {showModels && <div className="float-model-wrap"><FloatModel label="IMG 01" width={400} height={400} top="8%"  left="55%"  rotation={0} speed={0.25}  scrollY={heroScroll} zIndex={2} isDark={isDark} cameraZ={7.5}  modelScale={3.3} modelSrc="/models/RSPod13.glb"/></div>}
        {showImgs   && <FloatImg   label="IMG 02" width={230} height={230} top="45%" left="39%"  rotation={0} speed={0.20} scrollY={heroScroll} zIndex={1} src="/images/main/tedx.jpg" />}
        {showImgs   && <FloatImg   label="IMG 03" width={330} height={400} top="18%" left="70%"  rotation={0} speed={0.3}  scrollY={heroScroll} zIndex={1} src="/images/main/quebec1.jpg"/>}

        <div className="hero-corner-tag" style={{ transform: `translateY(calc(-50% + ${heroScroll * 0.08}px))` }} aria-hidden="true">
          Designer &amp; Engineer — 2026
        </div>

        <div className="hero-content">
          <p className="hero-eyebrow fade-up fade-up-1">✦ Portfolio — Aidan Schreder</p>
          <h1 id="hero-heading" className="hero-name fade-up fade-up-2" style={{ transform: `translateY(${heroScroll * -0.16}px)` }}>
            AIDAN<br /><span className="outline">SCHREDER</span>
          </h1>
          <p className="hero-subtitle fade-up fade-up-3">Designer &nbsp;/&nbsp; Engineer &nbsp;/&nbsp; Photographer</p>
        </div>

        <div className="hero-bottom fade-up fade-up-4">
          <p className="hero-tagline" style={{ transform: `translateY(${heroScroll * -0.04}px)` }}>
            Designer &amp; systems engineer crafting bold identities and impressive projects.
          </p>
          <div className="hero-scroll-indicator">
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INTERSTITIAL
      ══════════════════════════════════════════════ */}
      {showImgs && (
        <div className="interstitial" style={{ position: "relative", height: 340, overflow: "visible" }}>
          <FloatImg   label="IMG 04" width={320} height={220} top="-100px" left="5%"   rotation={0} speed={0.22} scrollY={scrollY - 700}  zIndex={2} src="/images/main/quebec2.jpg"  />
          {showModels && <div className="float-model-wrap"><FloatModel label="IMG 05" width={700} height={700} top="-100px" left="18%"  rotation={0} speed={0.2}  scrollY={scrollY - 700}  zIndex={2} isDark={isDark} cameraZ={7.5}  modelScale={2.2} modelSrc="/models/repairship12.glb"/></div>}
          <FloatImg   label="IMG 06" width={300} height={200} top="-40px"  left="68%"  rotation={0} speed={0.35} scrollY={scrollY - 700}  zIndex={1} src="/images/main/orbital.jpg" />
          <FloatImg   label="IMG 07" width={160} height={160} top="80px"   left="82%"  rotation={0} speed={0.38} scrollY={scrollY - 700}  zIndex={1} src="/images/main/spright.jpg" />
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════════ */}
      <section className="about-section" id="about" ref={aboutRef}>
        <div className="about-bg-text" style={{ transform: `translateY(${aboutScroll * 0.26}px)` }} aria-hidden="true">AS</div>

        {showImgs && <FloatImg label="IMG 09" width={300} height={130} top="30%"  left="55%"    rotation={0} speed={0.27} scrollY={aboutScroll} zIndex={1} src="/images/main/watcher.jpg" />}

        <div className="about-grid">
          <div>
            <div className="about-label">[ 01 ] — About</div>
            <h2 className="about-headline" style={{ transform: `translateY(${aboutScroll * 0.12}px)` }}>
              <span className="stroke"> Precision<br />MEETS </span> <br />CREATIVITY
            </h2>
          </div>
          <div className="about-right" style={{ transform: `translateY(${aboutScroll * 0.04}px)` }}>
            <p className="about-body">
              I design and build systems that work — and last. My projects span design, software,
              photography and mechanical engineering, but they all start the same way: curiosity, careful design,
              and an obsession with getting the details right. From leading robotics teams to designing
              identities for game studios, I focus on turning rough ideas into clear, functional results.
              <br /><br />
              I&apos;m drawn to work that lives at the intersection of technical rigor and creative thinking.
              Whether it&apos;s a mechanical system, a piece of software, or a visual identity, the goal is always
              the same: build something thoughtful, useful, and enduring.
            </p>
            <div className="about-stats">
              {[
                { n: "10+", l: "Logos Delivered"  },
                { n: "6+",  l: "Years Design Experience" },
                { n: "2,000+", l: "Professional Photos"    },
                { n: "7+",   l: "Original 3D print designs"  },
              ].map(({ n, l }) => (
                <div className="stat-item" key={l}>
                  <div className="stat-number">{n}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROJECTS SECTION
      ══════════════════════════════════════════════ */}
      <section className="section" id="projects" ref={engineeringRef}>
        <div className="section-ghost" style={{ transform: `translateY(${engScroll * 0.20}px)` }} aria-hidden="true">02</div>

        {showImgs && <FloatImg label="IMG 08" width={260} height={340} top="-40px"  left="400px"  rotation={0} speed={0.20} scrollY={engScroll} zIndex={0} src="/images/main/japan2.jpg" />}
        {showImgs && <FloatImg label="IMG 10" width={110} height={190} top="-120px" left="520px"  rotation={0} speed={0.22} scrollY={engScroll} zIndex={0} src="/images/main/japan1.jpg"/>}

        <div className="section-header">
          <div>
            <div className="section-number">[ 02 ]</div>
            <h2 className="section-title" style={{ transform: `translateY(${engScroll * 0.08}px)` }}>
              PROJECTS
            </h2>
          </div>
          <div className="section-meta" style={{ transform: `translateY(${engScroll * 0.04}px)` }}>
            Selected Projects<br />2025 – 2026
          </div>
        </div>

        <div className="eng-list">
          {engineeringProjects.map((proj, i) => {
            const rowDrift = engScroll * (i - 1) * 0.06;
            return (
              <div key={proj.id} className="eng-item" style={{ transform: `translateY(${rowDrift}px)` }}>
                <span className="eng-num">{proj.id}</span>
                <span className="eng-title">{proj.title}</span>
                <span className="eng-desc">{proj.desc}</span>
                <span className="eng-stack">{proj.stack}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════ */}
      <section className="footer-cta" id="contact" ref={footerRef}>
        <div className="footer-ghost" style={{ transform: `translateX(-50%) translateY(${ftScroll * 0.28}px)` }} aria-hidden="true">CTA</div>

        {showModels && <div className="float-model-wrap"><FloatModel label="IMG 11" width={400} height={600} top="80px"  left="-20px"  rotation={0} speed={0.32}  scrollY={ftScroll} zIndex={3} isDark={isDark} cameraZ={7.5}  modelScale={1.7} modelSrc="/models/hotel5.glb"/></div>}
        {showImgs   && <FloatImg   label="IMG 12" width={260} height={260} top="60px"  left="76%"    rotation={0} speed={-0.18} scrollY={ftScroll} zIndex={1}  src="/images/main/854.jpg" />}

        <p className="footer-cta-label">[ 03 ] — Let&apos;s Work Together</p>

        <span className="footer-line1" style={{ transform: `translateY(${ftScroll * 0.01}px)` }} aria-hidden="true">
          START A
        </span>
        <span className="footer-line2" style={{ transform: `translateY(${ftScroll * -0.01}px)` }} aria-hidden="true">
          PROJECT
        </span>

        <div className="cta-buttons">
          <a
            href="/thank-you"
            className="cta-button"
            onClick={() => trackGA4Event("contact_click", { source: "home_cta" })}
          >
            Request Design Services <span className="cta-arrow">→</span>
          </a>
          <a
            href="/portfolio"
            className="cta-button-outline"
            onClick={() => trackGA4Event("portfolio_link_click", { source: "home_cta" })}
          >
            View Design Portfolio <span className="cta-arrow">→</span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {themeConfig.copyrightYear} {themeConfig.copyrightName}</span>
          <span>Website built using Next.js, React, Vercel, and Node.js</span>
          <span style={{ opacity: 0.45 }}>Updated {LAST_UPDATED}</span>
        </div>
      </section>
      </main>
    </div>
  );
}