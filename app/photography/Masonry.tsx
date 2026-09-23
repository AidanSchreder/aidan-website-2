"use client";

// Three-column masonry with staggered column starts and "nested" units: two
// photos sharing one slot side by side. Columns are balanced by height
// (shortest column takes the next unit), deterministically, so server and
// client agree. Narrower screens reflow to two columns (CSS multi-column)
// and then one (original order via CSS `order`).

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFocus } from "./PhotoShell";
import { useDwell } from "../_lib/useDwell";
import type { Tile, Unit } from "./units";
import styles from "./photography.module.css";

/** Rough rendered column width, used to weigh the stagger offsets when balancing. */
const COL_PX = 380;
const GAP_PX = 10;

function height(u: Unit) {
  if (u.kind === "single") return u.tile.height / u.tile.width;
  const [a, b] = u.tiles;
  return 1 / (a.width / a.height + b.width / b.height);
}

function balance(units: Unit[], offsets: number[]) {
  const cols = offsets.map((o) => ({ h: o / COL_PX, items: [] as { unit: Unit; i: number }[] }));
  units.forEach((unit, i) => {
    const col = cols.reduce((a, b) => (b.h < a.h - 0.001 ? b : a));
    col.items.push({ unit, i });
    col.h += height(unit) + GAP_PX / COL_PX;
  });
  return cols;
}

const SIZES_SINGLE = "(max-width: 600px) 100vw, (max-width: 1100px) 45vw, 30vw";
const SIZES_PAIR = "(max-width: 600px) 50vw, (max-width: 1100px) 23vw, 15vw";

export function Masonry({
  units,
  offsets = [0, 0, 0],
  linked,
  onOpen,
}: {
  units: Unit[];
  offsets?: number[];
  linked?: boolean;
  onOpen?: (tile: Tile) => void;
}) {
  const cols = useMemo(() => balance(units, offsets), [units, offsets]);
  const { focus, setFocus } = useFocus();

  const tile = (t: Tile, i: number, inPair: boolean) => (
    <PhotoTile
      key={t.id}
      tile={t}
      inPair={inPair}
      order={i}
      preload={i < 4}
      dim={focus?.from === "nav" && focus.slug !== t.slug}
      onEnter={() => setFocus({ slug: t.slug, from: "photo" })}
      href={linked ? `/photography/${t.slug}#${encodeURIComponent(t.file)}` : undefined}
      onOpen={onOpen ? () => onOpen(t) : undefined}
    />
  );

  return (
    <div className={styles.masonry} onMouseLeave={() => setFocus(null)}>
      {cols.map((col, c) => (
        <div key={c} className={styles.col} style={{ ["--offset" as string]: `${offsets[c] ?? 0}px` }}>
          {col.items.map(({ unit, i }) =>
            unit.kind === "single" ? (
              tile(unit.tile, i, false)
            ) : (
              <div key={unit.tiles[0].id} className={`${styles.unit} ${styles.pair}`} style={{ order: i }}>
                {unit.tiles.map((t) => tile(t, i, true))}
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoTile({
  tile,
  inPair,
  order,
  preload,
  dim,
  onEnter,
  href,
  onOpen,
}: {
  tile: Tile;
  inPair: boolean;
  order: number;
  preload: boolean;
  dim: boolean;
  onEnter: () => void;
  href?: string;
  onOpen?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const ref = useDwell<HTMLDivElement>({
    section: "photography",
    id: tile.id,
    title: `${tile.title} · ${tile.file}`,
    thumb: tile.src,
    href: `/photography/${tile.slug}#${encodeURIComponent(tile.file)}`,
  });
  const ratio = tile.width / tile.height;

  const img = (
    <Image
      src={tile.src}
      alt={tile.alt}
      width={tile.width}
      height={tile.height}
      sizes={inPair ? SIZES_PAIR : SIZES_SINGLE}
      quality={80}
      preload={preload}
      data-loaded={loaded || undefined}
      onLoad={() => setLoaded(true)}
    />
  );

  return (
    <div
      ref={ref}
      className={inPair ? styles.tile : `${styles.unit} ${styles.tile}`}
      style={{
        aspectRatio: `${tile.width} / ${tile.height}`,
        backgroundImage: `url(${tile.blur})`,
        ...(inPair ? { flex: `${ratio} 1 0%` } : { order }),
      }}
      data-dim={dim || undefined}
      onMouseEnter={onEnter}
    >
      {href ? (
        <Link href={href} aria-label={`${tile.alt}. Open ${tile.title}`}>
          {img}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} aria-label={`View ${tile.alt}`}>
          {img}
        </button>
      )}
    </div>
  );
}
