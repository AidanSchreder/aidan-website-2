// ── ROBOTS ────────────────────────────────────────────────────────────────────
// Place this file at: app/robots.ts
//
// Next.js App Router will automatically serve it at /robots.txt.
// This configuration allows all crawlers to index all pages and points them
// to your sitemap.
//
// If you ever add pages you don't want indexed (e.g. a private preview route),
// add a `disallow` entry for that path.

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // disallow: ["/private/"], // add paths to block here if needed
      },
    ],
    sitemap: "https://aidanschreder.com/sitemap.xml",
  };
}
