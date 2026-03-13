// ── EVENT TRACKING SNIPPETS (GA4) ────────────────────────────────────────────
// These replace the earlier Plausible snippets. The pattern is identical —
// only the import changes from `trackEvent` to `trackGA4Event`.
//
// Add this import near the top of both client component files:
//
//   import { trackGA4Event } from "../components/GoogleAnalytics";


// ════════════════════════════════════════════════════════════════════════════
// FILE: app/page.tsx  (your HomeClient component)
// ════════════════════════════════════════════════════════════════════════════

// ── 1. Contact mailto click (home footer) ────────────────────────────────────
//
// BEFORE:
//   <a href="mailto:hello@aidanschreder.com" className="cta-button">
//
// AFTER:
//   <a
//     href="mailto:hello@aidanschreder.com"
//     className="cta-button"
//     onClick={() => trackGA4Event("contact_click", { source: "home_cta" })}
//   >


// ── 2. Portfolio link click ───────────────────────────────────────────────────
//
// BEFORE:
//   <a href="/portfolio" className="cta-button-outline">
//
// AFTER:
//   <a
//     href="/portfolio"
//     className="cta-button-outline"
//     onClick={() => trackGA4Event("portfolio_link_click", { source: "home_cta" })}
//   >


// ════════════════════════════════════════════════════════════════════════════
// FILE: app/portfolio/PortfolioClient.tsx
// ════════════════════════════════════════════════════════════════════════════

// ── 3. Lightbox open (project viewed) ────────────────────────────────────────
//
// BEFORE:
//   const openLightbox = (piece: Piece, slide: number, rect: DOMRect) => {
//     setLightbox({ piece, slide, rect: { ... } });
//   };
//
// AFTER:
//   const openLightbox = (piece: Piece, slide: number, rect: DOMRect) => {
//     setLightbox({ piece, slide, rect: { ... } });
//     trackGA4Event("project_viewed", {
//       project: piece.title,
//       category: piece.categories.join(", "),
//     });
//   };


// ── 4. Category filter selected ───────────────────────────────────────────────
//
// BEFORE:
//   const selectCategory = (cat: string) => {
//     const next = selected === cat ? "" : cat;
//     setSelected(next);
//     if (next !== "") setHasEverSelected(true);
//   };
//
// AFTER:
//   const selectCategory = (cat: string) => {
//     const next = selected === cat ? "" : cat;
//     setSelected(next);
//     if (next !== "") {
//       setHasEverSelected(true);
//       trackGA4Event("category_selected", { category: next });
//     }
//   };


// ── 5. Contact click (portfolio footer) ──────────────────────────────────────
//
//   <a
//     href="mailto:hello@aidanschreder.com"
//     className="cta-button"
//     onClick={() => trackGA4Event("contact_click", { source: "portfolio_cta" })}
//   >
//
// Using source: "portfolio_cta" vs "home_cta" lets you see in GA4 whether
// clients reach out from the home page or after browsing your work.


// ════════════════════════════════════════════════════════════════════════════
// VIEWING YOUR EVENTS IN GA4
// ════════════════════════════════════════════════════════════════════════════
//
// Custom events appear in GA4 under:
//   Reports → Engagement → Events
//
// To see event parameters (e.g. which project was viewed):
//   Configure → Custom Definitions → Create custom dimension
//   → map "project", "category", "source" as event-scoped dimensions
//
// Scroll depth is tracked automatically by GA4 — no custom code needed.
// It fires a `scroll` event at the 90% threshold by default.
// To see it: Reports → Engagement → Events → scroll
