// Scans public/photography into a photo library.
//
// Layout:
//   public/photography/<collection-folder>/<photo files>
//   public/photography/<collection-folder>/info.json   (optional)
//
// A photo whose filename ends in `_home` (e.g. IMG_2034_home.jpg) is eligible
// for the /photography collage. Photos sort by filename, so prefix with
// 01, 02... to control order inside a collection.
//
// info.json (every field optional):
//   { "title": "Quebec: Night", "description": "...", "location": "...",
//     "year": "2024", "order": 1, "captions": { "01_home.jpg": "..." } }
//
// Folders starting with "_" or "." are ignored (use them for drafts), and a
// folder named "about" is skipped because /photography/about is a page.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "photography");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;
const HOME_TAG = /_home(?=\.[a-z0-9]+$)/i;

// Blur placeholders are the slow part; cache them by path + mtime so dev
// refreshes stay fast.
const cache = new Map();

function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFolder(name) {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function readInfo(dir) {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, "info.json"), "utf8"));
  } catch {
    return {};
  }
}

async function describePhoto(file, folder, info) {
  const full = path.join(ROOT, folder, file);
  const stat = await fs.stat(full);
  const key = `${full}:${stat.mtimeMs}`;
  let meta = cache.get(key);
  if (!meta) {
    const image = sharp(full);
    const { width = 0, height = 0, orientation } = await image.metadata();
    // EXIF orientations 5–8 are rotated 90°, so the displayed size is swapped.
    const rotated = orientation !== undefined && orientation >= 5;
    const blur = await sharp(full)
      .rotate()
      .resize(16, 16, { fit: "inside" })
      .jpeg({ quality: 45 })
      .toBuffer();
    meta = {
      width: rotated ? height : width,
      height: rotated ? width : height,
      blur: `data:image/jpeg;base64,${blur.toString("base64")}`,
    };
    cache.set(key, meta);
  }
  return {
    file,
    src: `/photography/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
    width: meta.width,
    height: meta.height,
    blur: meta.blur,
    home: HOME_TAG.test(file),
    caption: info.captions?.[file] ?? null,
  };
}

export async function scanPhotos() {
  let entries;
  try {
    entries = await fs.readdir(ROOT, { withFileTypes: true });
  } catch {
    return { collections: [] };
  }

  // "about" is reserved for /photography/about.
  const folders = entries
    .filter((e) => e.isDirectory() && !/^[._]/.test(e.name) && slugify(e.name) !== "about")
    .map((e) => e.name);

  const collections = await Promise.all(
    folders.map(async (folder) => {
      const dir = path.join(ROOT, folder);
      const info = await readInfo(dir);
      const files = (await fs.readdir(dir))
        .filter((f) => IMAGE.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const photos = await Promise.all(files.map((f) => describePhoto(f, folder, info)));
      return {
        slug: slugify(folder),
        title: info.title ?? titleFromFolder(folder),
        description: info.description ?? null,
        location: info.location ?? null,
        year: info.year ?? null,
        order: typeof info.order === "number" ? info.order : 999,
        photos,
      };
    }),
  );

  return {
    collections: collections
      .filter((c) => c.photos.length > 0)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
  };
}
