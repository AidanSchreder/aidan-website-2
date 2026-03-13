// ── THEME CONFIGURATION ───────────────────────────────────────────────────────
//
// All colour tokens live here. Both pages import these and inject them as
// CSS custom properties — a colour change here propagates everywhere.
//
// HOW TO CHANGE A COLOUR
// ──────────────────────
// Find the token, update the value, save. Any valid CSS colour works.
//
// HOW TO CHANGE COPYRIGHT INFO
// ────────────────────────────
// Update copyrightYear and copyrightName below.

export const themeConfig = {

  copyrightYear: "2026",
  copyrightName: "Aidan Schreder",

  // ── DARK MODE TOKENS ────────────────────────────────────────────────────────
  dark: {
    bg:             "#000000",
    fg:             "#ffffff",
    gray:           "#888888",
    muted:          "rgba(255,255,255,0.08)",
    heroGhost:      "rgba(255,255,255,0.06)",
    statBorder:     "#333333",
    btnBg:          "#ffffff",
    btnFg:          "#000000",
    btnHoverFg:     "#ffffff",
    btnHoverBorder: "#ffffff",
    toggleBg:       "#1a1a1a",
    toggleFg:       "#ffffff",
    toggleBorder:   "rgba(255,255,255,0.15)",
    outlineStroke:  "rgba(255,255,255,0.07)",
    sectionBorder:  "rgba(255,255,255,0.08)",
    engHoverBg:     "rgba(255,255,255,0.02)",
    decoLine:       "rgba(255,255,255,0.06)",
  },

  // ── LIGHT MODE TOKENS ───────────────────────────────────────────────────────
  light: {
    bg:             "#ffffff",
    fg:             "#000000",
    gray:           "#666666",
    muted:          "rgba(0,0,0,0.06)",
    heroGhost:      "rgba(0,0,0,0.05)",
    statBorder:     "#cccccc",
    btnBg:          "#000000",
    btnFg:          "#ffffff",
    btnHoverFg:     "#000000",
    btnHoverBorder: "#000000",
    toggleBg:       "#f0f0f0",
    toggleFg:       "#000000",
    toggleBorder:   "rgba(0,0,0,0.12)",
    outlineStroke:  "rgba(0,0,0,0.07)",
    sectionBorder:  "rgba(0,0,0,0.08)",
    engHoverBg:     "rgba(0,0,0,0.02)",
    decoLine:       "rgba(0,0,0,0.06)",
  },

  // ── PAGE-SPECIFIC IMAGE TOKENS ───────────────────────────────────────────────
  // img-bg, img-border, etc. differ slightly between home and portfolio pages.

  home: {
    dark: {
      imgBg:     "#111111",
      imgBorder: "rgba(255,255,255,0.12)",
      imgLabel:  "rgba(255,255,255,0.5)",
      imgHint:   "rgba(255,255,255,0.2)",
      imgShadow: "rgba(0,0,0,0.6)",
    },
    light: {
      imgBg:     "#e8e8e8",
      imgBorder: "rgba(0,0,0,0.12)",
      imgLabel:  "rgba(0,0,0,0.5)",
      imgHint:   "rgba(0,0,0,0.25)",
      imgShadow: "rgba(0,0,0,0.15)",
    },
  },

  portfolio: {
    dark: {
      imgBg:        "#0d0d0d",
      imgBorder:    "rgba(255,255,255,0.10)",
      imgLabel:     "rgba(255,255,255,0.4)",
      imgHint:      "rgba(255,255,255,0.18)",
      imgShadow:    "rgba(0,0,0,0.7)",
      chipBg:       "transparent",
      chipBorder:   "rgba(255,255,255,0.18)",
      chipFg:       "rgba(255,255,255,0.5)",
      chipActiveBg: "#ffffff",
      chipActiveFg: "#000000",
      cardBg:       "#080808",
      cardBorder:   "rgba(255,255,255,0.06)",
    },
    light: {
      imgBg:        "#eeeeee",
      imgBorder:    "rgba(0,0,0,0.10)",
      imgLabel:     "rgba(0,0,0,0.4)",
      imgHint:      "rgba(0,0,0,0.22)",
      imgShadow:    "rgba(0,0,0,0.12)",
      chipBg:       "transparent",
      chipBorder:   "rgba(0,0,0,0.18)",
      chipFg:       "rgba(0,0,0,0.5)",
      chipActiveBg: "#000000",
      chipActiveFg: "#ffffff",
      cardBg:       "#f5f5f5",
      cardBorder:   "rgba(0,0,0,0.06)",
    },
  },

} as const;

// ── CSS VARIABLE BLOCK HELPERS ────────────────────────────────────────────────
// Return a CSS variable declarations string ready to inject into a <style> block.

export function homeDarkVars(): string {
  const s = themeConfig.dark;
  const i = themeConfig.home.dark;
  return `
          --bg:               ${s.bg};
          --fg:               ${s.fg};
          --gray:             ${s.gray};
          --muted:            ${s.muted};
          --hero-ghost:       ${s.heroGhost};
          --stat-border:      ${s.statBorder};
          --btn-bg:           ${s.btnBg};
          --btn-fg:           ${s.btnFg};
          --btn-hover-fg:     ${s.btnHoverFg};
          --btn-hover-border: ${s.btnHoverBorder};
          --toggle-bg:        ${s.toggleBg};
          --toggle-fg:        ${s.toggleFg};
          --toggle-border:    ${s.toggleBorder};
          --outline-stroke:   ${s.outlineStroke};
          --section-border:   ${s.sectionBorder};
          --eng-hover-bg:     ${s.engHoverBg};
          --deco-line:        ${s.decoLine};
          --img-bg:           ${i.imgBg};
          --img-border:       ${i.imgBorder};
          --img-label:        ${i.imgLabel};
          --img-hint:         ${i.imgHint};
          --img-shadow:       ${i.imgShadow};`;
}

export function homeLightVars(): string {
  const s = themeConfig.light;
  const i = themeConfig.home.light;
  return `
          --bg:               ${s.bg};
          --fg:               ${s.fg};
          --gray:             ${s.gray};
          --muted:            ${s.muted};
          --hero-ghost:       ${s.heroGhost};
          --stat-border:      ${s.statBorder};
          --btn-bg:           ${s.btnBg};
          --btn-fg:           ${s.btnFg};
          --btn-hover-fg:     ${s.btnHoverFg};
          --btn-hover-border: ${s.btnHoverBorder};
          --toggle-bg:        ${s.toggleBg};
          --toggle-fg:        ${s.toggleFg};
          --toggle-border:    ${s.toggleBorder};
          --outline-stroke:   ${s.outlineStroke};
          --section-border:   ${s.sectionBorder};
          --eng-hover-bg:     ${s.engHoverBg};
          --deco-line:        ${s.decoLine};
          --img-bg:           ${i.imgBg};
          --img-border:       ${i.imgBorder};
          --img-label:        ${i.imgLabel};
          --img-hint:         ${i.imgHint};
          --img-shadow:       ${i.imgShadow};`;
}

export function portfolioDarkVars(): string {
  const s = themeConfig.dark;
  const p = themeConfig.portfolio.dark;
  return `
          --bg:               ${s.bg};
          --fg:               ${s.fg};
          --gray:             ${s.gray};
          --muted:            ${s.muted};
          --hero-ghost:       ${s.heroGhost};
          --stat-border:      ${s.statBorder};
          --btn-bg:           ${s.btnBg};
          --btn-fg:           ${s.btnFg};
          --btn-hover-fg:     ${s.btnHoverFg};
          --btn-hover-border: ${s.btnHoverBorder};
          --toggle-bg:        ${s.toggleBg};
          --toggle-fg:        ${s.toggleFg};
          --toggle-border:    ${s.toggleBorder};
          --outline-stroke:   ${s.outlineStroke};
          --section-border:   ${s.sectionBorder};
          --eng-hover-bg:     ${s.engHoverBg};
          --deco-line:        ${s.decoLine};
          --img-bg:           ${p.imgBg};
          --img-border:       ${p.imgBorder};
          --img-label:        ${p.imgLabel};
          --img-hint:         ${p.imgHint};
          --img-shadow:       ${p.imgShadow};
          --chip-bg:          ${p.chipBg};
          --chip-border:      ${p.chipBorder};
          --chip-fg:          ${p.chipFg};
          --chip-active-bg:   ${p.chipActiveBg};
          --chip-active-fg:   ${p.chipActiveFg};
          --card-bg:          ${p.cardBg};
          --card-border:      ${p.cardBorder};`;
}

export function portfolioLightVars(): string {
  const s = themeConfig.light;
  const p = themeConfig.portfolio.light;
  return `
          --bg:               ${s.bg};
          --fg:               ${s.fg};
          --gray:             ${s.gray};
          --muted:            ${s.muted};
          --hero-ghost:       ${s.heroGhost};
          --stat-border:      ${s.statBorder};
          --btn-bg:           ${s.btnBg};
          --btn-fg:           ${s.btnFg};
          --btn-hover-fg:     ${s.btnHoverFg};
          --btn-hover-border: ${s.btnHoverBorder};
          --toggle-bg:        ${s.toggleBg};
          --toggle-fg:        ${s.toggleFg};
          --toggle-border:    ${s.toggleBorder};
          --outline-stroke:   ${s.outlineStroke};
          --section-border:   ${s.sectionBorder};
          --eng-hover-bg:     ${s.engHoverBg};
          --deco-line:        ${s.decoLine};
          --img-bg:           ${p.imgBg};
          --img-border:       ${p.imgBorder};
          --img-label:        ${p.imgLabel};
          --img-hint:         ${p.imgHint};
          --img-shadow:       ${p.imgShadow};
          --chip-bg:          ${p.chipBg};
          --chip-border:      ${p.chipBorder};
          --chip-fg:          ${p.chipFg};
          --chip-active-bg:   ${p.chipActiveBg};
          --chip-active-fg:   ${p.chipActiveFg};
          --card-bg:          ${p.cardBg};
          --card-border:      ${p.cardBorder};`;
}
