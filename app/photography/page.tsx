import type { Metadata } from "next";
import { connection } from "next/server";
import { altFor, getLibrary, photoId } from "../_lib/photos";
import { Masonry } from "./Masonry";
import { single, type Tile, type Unit } from "./units";
import styles from "./photography.module.css";

const description = "Photography by Aidan Schreder: streets, interiors and night.";

export async function generateMetadata(): Promise<Metadata> {
  const { collections } = await getLibrary();
  const cover = collections.flatMap((c) => c.photos.filter((p) => p.home))[0];
  return {
    title: "Photography",
    description,
    alternates: { canonical: "/photography" },
    openGraph: {
      title: "Aidan Schreder · Photography",
      description,
      url: "/photography",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : undefined,
    },
    twitter: { title: "Aidan Schreder · Photography", description },
  };
}

/** How many `_home` photos the collage shows at once (picked at random). */
const COLLAGE_SIZE = 30;
/** Chance that two adjacent portrait photos share one slot side by side. */
const PAIR_CHANCE = 0.35;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const portrait = (t: Tile) => t.height > t.width * 1.15;

/** Group the shuffled photos into units, occasionally nesting two portraits in one slot. */
function toUnits(tiles: Tile[]): Unit[] {
  const units: Unit[] = [];
  for (let i = 0; i < tiles.length; i++) {
    const [a, b] = [tiles[i], tiles[i + 1]];
    if (b && portrait(a) && portrait(b) && Math.random() < PAIR_CHANCE) {
      units.push({ kind: "pair", tiles: [a, b] });
      i++;
    } else {
      units.push(single(a));
    }
  }
  return units;
}

/** One column starts at the top; the other two start lower, by different amounts each visit. */
function staggerOffsets() {
  return shuffle([0, Math.round(40 + Math.random() * 90), Math.round(130 + Math.random() * 120)]);
}

export default async function PhotographyHome() {
  // Rendered per request so every visit gets a fresh arrangement.
  await connection();
  const { collections } = await getLibrary();

  const tagged: Tile[] = collections.flatMap((c) =>
    c.photos.flatMap((p, i) =>
      p.home
        ? [{ id: photoId(c, p), slug: c.slug, file: p.file, title: c.title, src: p.src, width: p.width, height: p.height, blur: p.blur, alt: altFor(c, p, i) }]
        : [],
    ),
  );

  return (
    <div className={styles.page}>
      <h1 className="sr-only">Aidan Schreder, photography</h1>
      <Masonry units={toUnits(shuffle(tagged).slice(0, COLLAGE_SIZE))} offsets={staggerOffsets()} linked />
    </div>
  );
}
