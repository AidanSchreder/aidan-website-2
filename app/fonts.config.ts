// ── FONT CONFIGURATION ───────────────────────────────────────────────────────
//
// Space Mono is now loaded via next/font/google instead of a Google Fonts
// @import URL. This preloads the font at build time, eliminates the extra
// network round-trip, and adds font-display: swap automatically — removing
// the largest source of font-related layout shift and render blocking.
//
// Prodes Stencil and Bank Gothic remain as @font-face declarations since they
// are local files — next/font/local could also be used for these, but the
// @font-face approach is correct and already includes font-display: swap.
//
// HOW TO USE SpaceMono IN YOUR PAGES:
//   Both page.tsx and PortfolioClient.tsx need to apply the font variable
//   so that --font-mono resolves correctly. Add the className to the root div:
//
//   import { SpaceMono } from "./fonts.config";           // page.tsx
//   import { SpaceMono } from "../fonts.config";          // PortfolioClient.tsx
//
//   <div className={SpaceMono.variable} data-theme={...}>
//
// The CSS variable --font-mono is still used throughout your styles unchanged.

import { Space_Mono } from "next/font/google";

// ── SPACE MONO (next/font/google) ─────────────────────────────────────────────
// Loads all weights/styles used across the site.
// `variable` mode exposes the font as a CSS custom property so your existing
// var(--font-mono) references continue to work with zero style changes.
export const SpaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-mono",   // maps to var(--font-mono) in your CSS
  preload: true,
});

// ── FONT CONFIG OBJECT ────────────────────────────────────────────────────────
// googleFontsUrl is now empty — Space Mono is handled by next/font above.
// The @import in your inline <style> block is removed from page.tsx and
// PortfolioClient.tsx; the font loads via the <link> tag Next.js injects.
export const fontConfig = {

  googleFontsUrl: "", // intentionally empty — Space Mono uses next/font now

  fontFace: `
  @font-face {
    font-family: 'Prodes Stencil';
    src: url('/fonts/ProdesStencil-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    font-synthesis: none;
  }
  @font-face {
    font-family: 'Bank Gothic';
    src: url('/fonts/Bank Gothic Light Regular.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    font-synthesis: none;
  }
  `,

  display: "'Prodes Stencil', sans-serif",
  title:   "'Bank Gothic', sans-serif",
  mono:    "'Space Mono', monospace",

} as const;