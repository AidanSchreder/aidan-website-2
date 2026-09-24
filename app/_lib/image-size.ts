import "server-only";

import path from "node:path";
import sharp from "sharp";

const cache = new Map<string, { width: number; height: number }>();

/**
 * Intrinsic size of a file in /public (EXIF rotation applied). Runs at build for static pages;
 * `turbopackIgnore` keeps /public out of the server functions (see app/_lib/og.tsx).
 */
export async function sizeOf(src: string) {
  let size = cache.get(src);
  if (!size) {
    const meta = await sharp(path.join(/* turbopackIgnore: true */ process.cwd(), "public", decodeURIComponent(src))).metadata();
    const rotated = (meta.orientation ?? 1) >= 5;
    size = { width: (rotated ? meta.height : meta.width) ?? 1, height: (rotated ? meta.width : meta.height) ?? 1 };
    cache.set(src, size);
  }
  return size;
}

export async function withSizes<T extends { src: string }>(items: T[]) {
  return Promise.all(items.map(async (item) => ({ ...item, ...(await sizeOf(item.src)) })));
}
