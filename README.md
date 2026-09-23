# aidanschreder.com

Next.js 16 site, split by audience: `/engineering`, `/design`, `/photography` and `/3d`, each with its
own about page inside it (`/photography/about`, …). The root `/` is a card (name + contact) that
deliberately links nowhere: each section is reached by a link you send.

**Search.** A section with `searchable: false` in `content/site.ts` is noindexed and left out of the
sitemap (currently engineering; its PDFs and images get an `X-Robots-Tag` in `next.config.ts`).
Private analytics at `/stats`. The v1 site is kept on the `legacy-v1` branch and in `legacy/`.

```bash
npm run dev      # also regenerates the photo manifest
npm run build
```

## Adding work

| Section | Where |
| --- | --- |
| Engineering | `content/engineering.ts` + images in `public/images/engineering/<id>/` (`0.jpg` is the cover) |
| Design | `content/design.ts` + images in `public/images/portfolio/<folder>/` |
| 3D | `content/three-d.ts` + images in `public/images/portfolio/<folder>/` |
| Photography | Drop files into `public/photography/<collection>/` — nothing to edit |

**Photography.** Each folder in `public/photography/` is a collection; photos sort by filename.
Add `_home` to a filename (`IMG_2034_home.jpg`) to make it eligible for the randomized collage on
`/photography`. The collage is three staggered columns; adjacent portrait photos are sometimes
nested side by side in one slot (tune `PAIR_CHANCE` in `app/photography/page.tsx`). An optional `info.json` in the folder sets the title, description, location, sort
order and per-photo captions (see `scripts/photo-scan.mjs`). Folders starting with `_` are ignored.

**Résumé.** Put the file at `public/resume.pdf`; the engineering page shows the link automatically.

**New section (e.g. architecture).** Add it to `SECTIONS` in `content/site.ts` and create `app/<slug>/`
(plus `app/<slug>/about/`). It then appears in the sitemap and in analytics. Each section
can set its own inquiry `email` there (engineering uses the UWaterloo address).

## Analytics setup (once)

1. Vercel → project → Storage → connect **Upstash Redis** (free tier). It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Add an env var `STATS_PASSWORD` (the /stats login). Optionally `ANALYTICS_SALT` (any random string).
3. Redeploy. Visit `/stats`.

Counts only production traffic on aidanschreder.com, skips bots, and uses no cookies (visitors are a
daily salted hash). GA4 and Microsoft Clarity still run alongside.
