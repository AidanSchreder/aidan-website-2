import type { MetadataRoute } from "next";
import { SECTIONS, SITE_URL } from "@/content/site";
import { getLibrary } from "./_lib/photos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections } = await getLibrary();
  const now = new Date();
  // Sections kept out of search are left out here and noindexed in their layout.
  const listed = SECTIONS.filter((s) => s.searchable !== false);
  return [
    { url: SITE_URL, lastModified: now, priority: 1 },
    ...listed.map((s) => ({ url: `${SITE_URL}${s.href}`, lastModified: now, priority: 0.9 })),
    ...listed.flatMap((s) => (s.about ? [{ url: `${SITE_URL}${s.about}`, lastModified: now, priority: 0.5 }] : [])),
    ...collections.map((c) => ({ url: `${SITE_URL}/photography/${c.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
