"use client";

// Masonry with "nested" units (two photos sharing one slot side by side) and
// "wide" ones (a landscape across two columns). The layout is worked out in
// pack.ts for three columns and for two, then CSS picks one by width; a
// single column just flows in order. Deterministic, so server and client agree.

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFocus } from "./PhotoShell";
import { useDwell } from "../_lib/useDwell";
import { pack, type Layout, type Len } from "./pack";
import type { Tile, Unit } from "./units";
import styles from "./photography.module.css";

/** Typical rendered column widths, for comparing heights while placing. */
const COL_PX = { 3: 380, 2: 440 };

const SIZES_SINGLE = "(max-width: 600px) 100vw, (max-width: 1100px) 45vw, 30vw";
const SIZES_PAIR = "(max-width: 600px) 50vw, (max-width: 1100px) 23vw, 15vw";
const SIZES_WIDE = "(max-width: 1100px) 100vw, 60vw";

const round = (n: number) => Math.round(n * 1e5) / 1e5;
const len = ([a, p]: Len) => `calc(${round(a)} * var(--w) + ${round(p)}px)`;

/** Position of unit `i` in each layout, as custom properties the CSS picks from. */
function place(layouts: [number, Layout][], i: number) {
  const vars: Record<string, string> = {};
  for (const [n, { boxes }] of layouts) {
    const b = boxes[i];
    vars[`--x${n}`] = `calc(${b.col} * (var(--w) + var(--gap)))`;
    vars[`--w${n}`] = b.span === 1 ? "var(--w)" : `calc(${b.span} * var(--w) + ${b.span - 1} * var(--gap))`;
    vars[`--y${n}`] = len(b.top);
    vars[`--h${n}`] = len(b.h);
  }
  return vars as CSSProperties;
}

export function Masonry({
  units,
  offsets,
  linked,
  onOpen,
}: {
  units: Unit[];
  /** px each of the three columns starts below the top. */
  offsets?: number[];
  linked?: boolean;
  onOpen?: (tile: Tile) => void;
}) {
  const layouts = useMemo<[number, Layout][]>(
    () => [
      [3, pack(units, 3, COL_PX[3], offsets)],
      [2, pack(units, 2, COL_PX[2])],
    ],
    [units, offsets],
  );
  const { focus, setFocus } = useFocus();

  const board = Object.fromEntries(
    layouts.map(([n, { bottoms }]) => [`--height${n}`, `max(${bottoms.map(len).join(", ")})`]),
  ) as CSSProperties;

  const tile = (t: Tile, i: number, kind: Unit["kind"], style?: CSSProperties) => (
    <PhotoTile
      key={t.id}
      tile={t}
      kind={kind}
      style={style}
      preload={i < 4}
      dim={focus?.from === "nav" && focus.slug !== t.slug}
      onEnter={() => setFocus({ slug: t.slug, from: "photo" })}
      href={linked ? `/photography/${t.slug}#${encodeURIComponent(t.file)}` : undefined}
      onOpen={onOpen ? () => onOpen(t) : undefined}
    />
  );

  return (
    <div className={styles.masonry} onMouseLeave={() => setFocus(null)}>
      <div className={styles.board} style={board}>
        {units.map((unit, i) =>
          unit.kind === "pair" ? (
            <div key={unit.tiles[0].id} className={`${styles.unit} ${styles.pair}`} style={place(layouts, i)}>
              {unit.tiles.map((t) => tile(t, i, "pair"))}
            </div>
          ) : (
            tile(unit.tile, i, unit.kind, place(layouts, i))
          ),
        )}
      </div>
    </div>
  );
}

function PhotoTile({
  tile,
  kind,
  style,
  preload,
  dim,
  onEnter,
  href,
  onOpen,
}: {
  tile: Tile;
  kind: Unit["kind"];
  /** Placement, for a tile that is a unit on its own. */
  style?: CSSProperties;
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
  const inPair = kind === "pair";
  const ratio = tile.width / tile.height;

  const img = (
    <Image
      src={tile.src}
      alt={tile.alt}
      width={tile.width}
      height={tile.height}
      sizes={inPair ? SIZES_PAIR : kind === "wide" ? SIZES_WIDE : SIZES_SINGLE}
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
        ...(inPair ? { flex: `${ratio} 1 0%` } : style),
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
