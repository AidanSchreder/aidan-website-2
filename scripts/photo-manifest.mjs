// Writes app/_generated/photos.json from public/photography/images.
// Runs automatically before `npm run dev` and `npm run build`; run it by hand
// with `npm run photos`. In development the site also rescans on every
// request, so new photos show up on refresh without a restart.

import fs from "node:fs/promises";
import path from "node:path";
import { scanPhotos } from "./photo-scan.mjs";

const out = path.join(process.cwd(), "app", "_generated", "photos.json");
const library = await scanPhotos();

await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify(library, null, 2) + "\n");

const photos = library.collections.reduce((n, c) => n + c.photos.length, 0);
const home = library.collections.reduce((n, c) => n + c.photos.filter((p) => p.home).length, 0);
console.log(`photos: ${library.collections.length} collections, ${photos} photos, ${home} tagged _home`);
