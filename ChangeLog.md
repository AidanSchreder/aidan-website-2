# Changelog

All meaningful changes to the portfolio site are recorded here.
Update this file — and `LAST_UPDATED` in `content.config.ts` — whenever you
add work, redesign a section, or change site behaviour.

---

## March 2026

- Extracted all content to `content.config.ts` — add projects and portfolio
  pieces by editing that one file, no component knowledge required
- Extracted all colour tokens to `theme.config.ts` — rebrand by editing
  one file; changes propagate to both pages automatically
- Added "Last Updated" timestamp to both page footers
- Added `fonts.config.ts` — font swaps require editing one file only
- Migrated to three-font system: Prodes Stencil (display), Bank Gothic
  (project/piece titles), Space Mono (body)
- Added Portfolio link to home page nav bar
- Removed redundant "View Full Portfolio" button from portfolio page CTA

## Earlier (pre-changelog)

- Initial build: home page with Three.js 3D model viewer, parallax
  floating images, about section, projects list, footer CTA
- Portfolio page with category filter, slideshow cards, lightbox
- Dark / light theme toggle with custom cursor
- Vercel deployment
