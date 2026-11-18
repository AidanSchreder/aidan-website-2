import type { Metadata } from "next";
import { NAME } from "@/content/site";

type Image = { url: string; width?: number; height?: number; alt?: string };

/**
 * Link-preview tags for a page. A page that sets `openGraph` or `twitter`
 * replaces the root layout's objects rather than merging with them, so every
 * page builds both here: otherwise previews lose the site name and X shows
 * a small square card. Without `images`, the section's opengraph-image is used
 * (the key must then be absent: even `images: undefined` hides it).
 */
export function share({ title, description, url, images }: { title: string; description: string; url: string; images?: Image[] }): Pick<Metadata, "openGraph" | "twitter"> {
  const img = images ? { images } : {};
  return {
    openGraph: { type: "website", locale: "en_CA", siteName: NAME, title, description, url, ...img },
    twitter: { card: "summary_large_image", title, description, ...img },
  };
}
