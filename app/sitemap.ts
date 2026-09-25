import type { MetadataRoute } from "next";
import { SECTIONS, SITE_URL } from "@/content/site";
import { DESIGN } from "@/content/design";
import { THREE_D } from "@/content/three-d";
import { getLibrary } from "./_lib/photos";

// No lastModified: it would be the build time on every page, and search
// engines learn to ignore a lastmod that is always "now". Images are listed
// with their pages because the pages only show /_next/image URLs.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections } = await getLibrary();
  const abs = (path: string) => `${SITE_URL}${path}`;
  // Sections kept out of search are left out here and noindexed in their layout.
  const listed = SECTIONS.filter((s) => s.searchable !== false);
  const images: Record<string, string[]> = {
    "/photography": collections.flatMap((c) => c.photos.filter((p) => p.home).map((p) => abs(p.src))),
    "/3d": THREE_D.flatMap((p) => p.captions.map((_, i) => abs(`/3d/images/${p.id}/${i}.jpg`))),
  };
  return [
    { url: SITE_URL, priority: 1 },
    ...listed.map((s) => ({ url: abs(s.href), priority: 0.9, images: images[s.href] })),
    ...listed.flatMap((s) => (s.about ? [{ url: abs(s.about), priority: 0.5 }] : [])),
    ...collections.map((c) => ({ url: abs(`/photography/${c.slug}`), priority: 0.7, images: c.photos.map((p) => abs(p.src)) })),
    ...DESIGN.map((p) => ({ url: abs(`/design/${p.id}`), priority: 0.7, images: p.slides.map((s) => abs(s.src)) })),
  ];
}
