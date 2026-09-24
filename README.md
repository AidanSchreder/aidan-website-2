# aidanschreder.com

Next.js 16 site, split by audience: `/engineering`, `/design`, `/photography` and `/3d`, each with its
own about page inside it (`/photography/about`, …). The root `/` is a card (name + contact) that
deliberately links nowhere: each section is reached by a link you send.

**Search.** A section with `searchable: false` in `content/site.ts` is noindexed and left out of the
sitemap (currently engineering; its files under `public/engineering/` get an `X-Robots-Tag` in
`next.config.ts`).
Private analytics at `/stats`. The v1 site is kept on the `legacy-v1` branch and in `legacy/`.

```bash
npm run dev      # also regenerates the photo manifest
npm run build
```

## Assets

`public/` is organised by section, then by type, then by project or collection (a folder named
after the entry's `id`), so each file's URL says where it belongs:

```
public/
  engineering/  images/<id>/  videos/<id>/  documents/   (PDFs: portfolio, ICRA paper, résumé)
  design/       images/<id>/  textures/                  (UI textures, e.g. the grain mask)
  photography/  images/<collection>/
  3d/           images/<id>/  videos/<id>/  models/      (meshopt-compressed .glb)
```

Fonts sit beside their loaders in `app/_fonts/`. Files only the v1 site used are in `legacy/public/`.
Old URLs (`/tron-portfolio.pdf`, `/images/portfolio/02/…`, …) redirect to the new ones
(`next.config.ts`).

## Adding work

| Section | Where |
| --- | --- |
| Engineering | `content/engineering.ts` + images in `public/engineering/images/<id>/` (`0.jpg` is the cover) |
| Design | `content/design.ts` + images in `public/design/images/<id>/` (each piece gets `/design/<id>`; wrap a caption in `home("…")` to put that slide on the `/design` grid) |
| 3D | `content/three-d.ts` + images in `public/3d/images/<id>/` |
| Photography | Drop files into `public/photography/images/<collection>/` — nothing to edit |

**Photography.** Each folder in `public/photography/images/` is a collection; photos sort by filename.
Add `_home` to a filename (`IMG_2034_home.jpg`) to make it eligible for the randomized collage on
`/photography`. The collage is three staggered columns; adjacent portrait photos are sometimes
nested side by side in one slot (tune `PAIR_CHANCE` in `app/photography/page.tsx`). An optional `info.json` in the folder sets the title, description, location, sort
order and per-photo captions (see `scripts/photo-scan.mjs`). Folders starting with `_` are ignored,
so they work as drafts: `_winnipeg`, `_japan-1`, `_japan-2` and `_untitled` are v1's unpublished sets.

**Résumé.** Put the file at `public/engineering/documents/resume.pdf`; the engineering page shows the
link automatically.

**New section (e.g. architecture).** Add it to `SECTIONS` in `content/site.ts` and create `app/<slug>/`
(plus `app/<slug>/about/`). It then appears in the sitemap and in analytics. Each section
can set its own inquiry `email` there (engineering uses the UWaterloo address).

## Messages setup (once)

Under the email line on engineering, design, photography and 3D is a small form (message + email).
Each message is sent to your phone by a private Telegram bot, and a copy is kept on `/stats`
(**Messages**). Visitors only ever see the website. Hidden-field and timing checks drop bots, and
one visitor can send 5 an hour (100 a day in total).

1. In Telegram, message **@BotFather** → `/newbot` → pick a name. It replies with a token.
2. Open your new bot and send it any message (a bot can only message people who have written to it).
3. Put the token in `.env.local` as a line like `TELEGRAM_BOT_TOKEN=123456789:AAH4x…` (just the
   token: no quotes or brackets), then run `npm run telegram`. It prints your `TELEGRAM_CHAT_ID=…`;
   add that line to `.env.local` too.
4. Vercel → project → Settings → Environment Variables: add both, then redeploy.

Without them, messages still land on `/stats`; in development they're also printed in the terminal.
The code is `app/_components/MessageForm.tsx`, `app/api/message/route.ts` and `app/_lib/messages.ts`.

## Analytics setup (once)

1. Vercel → project → Storage → connect **Upstash Redis** (free tier). It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Add an env var `STATS_PASSWORD` (the /stats login). Optionally `ANALYTICS_SALT` (any random string).
3. Redeploy. Visit `/stats`.

Counts only production traffic on aidanschreder.com, skips bots, and uses no cookies (visitors are a
daily salted hash). GA4 and Microsoft Clarity still run alongside.
