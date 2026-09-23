import "server-only";

import manifest from "../_generated/photos.json";

export interface Photo {
  file: string;
  src: string;
  width: number;
  height: number;
  blur: string;
  home: boolean;
  caption: string | null;
}

export interface Collection {
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  year: string | null;
  order: number;
  photos: Photo[];
}

export interface Library {
  collections: Collection[];
}

/**
 * Production reads the manifest generated at build time (scripts/photo-manifest.mjs).
 * Development rescans public/photography on every request, so dropping a photo
 * into a folder shows up on refresh.
 */
export async function getLibrary(): Promise<Library> {
  if (process.env.NODE_ENV === "development") {
    const { scanPhotos } = await import("../../scripts/photo-scan.mjs");
    return (await scanPhotos()) as Library;
  }
  return manifest as Library;
}

export const photoId = (c: Pick<Collection, "slug">, p: Pick<Photo, "file">) => `${c.slug}/${p.file}`;

export function altFor(c: Collection, p: Photo, index: number) {
  return p.caption ?? `${c.title}, photo ${index + 1}`;
}
