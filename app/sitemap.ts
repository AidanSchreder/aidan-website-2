// ── SITEMAP ───────────────────────────────────────────────────────────────────
// Place this file at: app/sitemap.ts
//
// Next.js App Router will automatically serve it at /sitemap.xml.
// After deploying, submit https://aidanschreder.com/sitemap.xml to:
//   Google Search Console → Sitemaps → Add a new sitemap
//
// To add more pages in the future (e.g. a blog, a case study page), append
// additional objects to the array below following the same shape.

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aidanschreder.com";

  // Update `lastModified` whenever you significantly update a page's content.
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,           // Home page is highest priority
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,           // Portfolio is the second most important page
    },
    // ── Add future pages below ───────────────────────────────────────────────
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: "yearly",
    //   priority: 0.6,
    // },
  ];
}
