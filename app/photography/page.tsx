import type { Metadata } from "next";
import { connection } from "next/server";
import { altFor, getLibrary, photoId } from "../_lib/photos";
import { share } from "../_lib/share";
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
    ...share({
      title: "Aidan Schreder · Photography",
      description,
      url: "/photography",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : undefined,
    }),
  };
}

/** How many `_home` photos the collage shows at once (picked at random). */
const COLLAGE_SIZE = 30;
/** Chance that two adjacent portrait photos share one slot side by side. */
const PAIR_CHANCE = 0.35;
/** One landscape spans two columns for about every this many units. */
const UNITS_PER_WIDE = 7;
/** Width over height a photo needs before it may span two columns. */
const WIDE_RATIO = 1.3;

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

/**
 * Lets a few landscapes span two columns, spread down the page: each takes
 * a spot near the middle of its own stretch of the collage. Panoramas are
 * likelier picks, since a single column shrinks them the most.
 */
function widen(units: Unit[]): Unit[] {
  const ratio = (t: Tile) => t.width / t.height;
  const chosen = units
    .flatMap((u) => (u.kind === "single" && ratio(u.tile) >= WIDE_RATIO ? [u.tile] : []))
    .map((t) => ({ t, key: Math.random() ** (1 / ratio(t)) })) // weighted by ratio
    .sort((a, b) => b.key - a.key)
    .slice(0, Math.round(units.length / UNITS_PER_WIDE))
    .map(({ t }) => t);
  if (!chosen.length) return units;

  const out = units.filter((u) => u.kind === "pair" || !chosen.includes(u.tile));
  const stretch = units.length / chosen.length;
  chosen.forEach((t, k) => {
    const at = Math.round((k + 0.2 + Math.random() * 0.6) * stretch);
    out.splice(Math.min(at, out.length), 0, { kind: "wide", tile: t });
  });
  return out;
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
      <Masonry units={widen(toUnits(shuffle(tagged).slice(0, COLLAGE_SIZE)))} linked />
    </div>
  );
}
