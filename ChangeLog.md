# Changelog

All meaningful changes to the portfolio site are recorded here.

---

## September 2026 — v2: split by audience

- Site restructured into standalone landing pages: `/engineering`, `/design`,
  `/photography`, `/3d`. `/` is a name-and-contact card that links nowhere, so
  the whole profile is never presented in one place; engineering is kept out of
  search (noindex, not in the sitemap). Each has its own nav, typography,
  texture and about page (`/engineering/about`, …); one quiet footer line links
  back to `/` and the section's about. `/about` redirects to `/`
- `/engineering` replaces the mechatronics PDF online: filterable project list
  with tools and skills, ICRA paper entry, own about page (PDF still served)
- `/photography`: Jessica Chou-style sidebar + randomized three-column collage
  with staggered column starts and nested photo pairs, built from folders;
  `_home` filename tag; per-photo shareable viewer
- `/design`: grain-gradient shapes behind the title and one in the footer
  (drawn on canvas; palette turned by `HUE_SHIFT` in
  `app/design/grain-fills.ts`; the rounded square breathes), a tilted,
  rounded grid of tiles that slowly fade through each project's
  `home("…")`-tagged slides and straighten to show its name on hover (every
  tile the same area and shaped like its first tagged slide; rows of two
  spread evenly across the full page width; every image, here and on the
  project pages, has a thin light edge on its top-left rim, plus an optional
  glow of grain in its own colours, off for now: `GLOW` in
  `app/design/Edge.tsx`), and a page per project
  (`/design/<id>`): lead image, write-up beside the details, every slide
  captioned, previous/next
- `/3d`: the v1 landing page (models, parallax renders, FLIP lightbox);
  models meshopt-compressed (172 MB → 22 MB) and lazy-loaded; parallax moved
  off React state
- Theme toggle is now a dot in each nav that morphs into a moon or sun on hover;
  per-page defaults (photography light), no flash before hydration
- Private `/stats` dashboard (Upstash Redis): visitors per section and a
  ranking of the most-opened projects, photos and pieces across the site
- Per-page titles, descriptions and Open Graph images; sitemap covers collections
- Contact is one line per page with a pre-filled subject (engineering uses
  aschrede@uwaterloo.ca); big CTAs, copyright and "updated" stamps removed
- Message form under the email line on engineering, design, photography and
  3D: two grey bubbles (message, email) as wide as the address, growing as
  the text wraps, with a "Send" that appears once both are filled. Short
  eased motion for each state (growing, sending, a shake for a bad address,
  folding away into the confirmation); on design and 3D the custom cursor
  turns into an I-beam over the fields. Messages go to a private Telegram
  bot and are kept on `/stats`; hidden-field, timing and rate-limit checks
  against spam
- `/portfolio` → `/design` and `/thank-you` → `/` redirects
- `public/` organised by section, then type (`images`, `videos`, `documents`,
  `models`, `textures`), then a folder per project or collection named after
  its id; old file URLs (including `/tron-portfolio.pdf`) redirect. Fonts moved
  beside their loaders; v1-only files moved to `legacy/public/`
- v1 kept on the `legacy-v1` branch and in `legacy/`

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
