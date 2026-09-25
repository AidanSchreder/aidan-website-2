// Places masonry units into columns ahead of time, identically on the server
// and the client, so nothing is measured and nothing shifts after hydration.
//
// Every length is `a·w + p` px, w being the rendered column width. CSS turns
// it into calc(a * var(--w) + p px), so one layout holds at every width.
//
// Units go to the shortest column. A wide unit spans two neighbouring columns,
// which have to end level first: the photos above it in both columns (back to
// the previous wide one) give a little, the shorter column's a bit taller and
// the taller column's a bit shorter, each cropping at most MAX_GIVE. When no
// two neighbours are that close, it waits while the next few photos are tried
// for the one that brings a pair closest.

import type { Unit } from "./units";

/** px; the same as --gap in photography.module.css. */
export const GAP = 10;
/** Most a photo gets cropped to level two columns (fraction of its height). */
const MAX_GIVE = 0.06;
/** How many upcoming photos a waiting wide one may try to level its columns. */
const LOOKAHEAD = 4;

export type Len = readonly [a: number, p: number];

export interface Box {
  col: number;
  span: number;
  top: Len;
  h: Len;
}

export interface Layout {
  /** Indexed like the units. */
  boxes: Box[];
  /** Where each column ends. */
  bottoms: Len[];
}

const add = (x: Len, y: Len): Len => [x[0] + y[0], x[1] + y[1]];
const sub = (x: Len, y: Len): Len => [x[0] - y[0], x[1] - y[1]];
const scale = (x: Len, k: number): Len => [x[0] * k, x[1] * k];
const ratio = (t: { width: number; height: number }) => t.width / t.height;

/** A unit's uncropped height at `span` columns wide. */
function natural(u: Unit, span: number): Len {
  if (u.kind === "pair") {
    // Two photos side by side at equal heights, with a gap between them.
    const r = ratio(u.tiles[0]) + ratio(u.tiles[1]);
    return [1 / r, -GAP / r];
  }
  const r = ratio(u.tile);
  return [span / r, ((span - 1) * GAP) / r];
}

/**
 * @param colPx typical rendered column width, for comparing heights while placing
 * @param offsets px each column starts below the top
 */
export function pack(units: Unit[], cols: number, colPx: number, offsets: number[] = []): Layout {
  const px = (l: Len) => l[0] * colPx + l[1];
  const boxes: Box[] = [];
  // Where each column's next unit goes (its bottom plus a gap).
  const next: Len[] = Array.from({ length: cols }, (_, c) => [0, offsets[c] ?? 0]);
  // Units since the column's last wide one: the ones that can give.
  const open: Box[][] = next.map(() => []);
  const underWide = next.map(() => false);

  const give = (c: number) => open[c].reduce((t, b) => t + px(b.h), 0);
  const shortest = (tops: number[]) => tops.reduce((best, t, c) => (t < tops[best] - 0.5 ? c : best), 0);

  function put(i: number, col: number, span: number) {
    const box: Box = { col, span, top: next[col], h: natural(units[i], span) };
    boxes[i] = box;
    const below = add(add(box.top, box.h), [0, GAP]);
    for (let c = col; c < col + span; c++) {
      next[c] = below;
      if (span === 1) open[c].push(box);
      else {
        open[c] = [];
        underWide[c] = true;
      }
    }
  }

  /** The neighbouring pair of columns needing the least cropping to meet, as the fraction each photo gives. */
  function bestPair(tops: number[], gives: number[], fresh: boolean[]) {
    let best: { col: number; crop: number } | null = null;
    for (let c = 0; c + 1 < cols; c++) {
      // Never stack a wide unit straight onto another.
      if (!fresh[c] || !fresh[c + 1]) continue;
      const diff = Math.abs(tops[c] - tops[c + 1]);
      const pool = gives[c] + gives[c + 1];
      const crop = diff < 0.5 ? 0 : pool > 0 ? diff / pool : Infinity;
      if (!best || crop < best.crop) best = { col: c, crop };
    }
    return best;
  }

  function state() {
    return {
      tops: next.map(px),
      gives: next.map((_, c) => give(c)),
      fresh: next.map((_, c) => !underWide[c] || open[c].length > 0),
    };
  }

  /** Grows (or shrinks) a column's open units by `by` in total, in proportion to their heights. */
  function stretch(c: number, by: Len) {
    const total = give(c);
    if (!total) return;
    let top = open[c][0].top;
    for (const b of open[c]) {
      b.h = add(b.h, scale(by, px(b.h) / total));
      b.top = top;
      top = add(add(top, b.h), [0, GAP]);
    }
    next[c] = top;
  }

  /** Brings columns c and c+1 to the same height, exactly, at any width. */
  function level(c: number) {
    const [lo, hi] = px(next[c]) <= px(next[c + 1]) ? [c, c + 1] : [c + 1, c];
    const diff = sub(next[hi], next[lo]);
    const gl = give(lo);
    const gh = give(hi);
    if (gl + gh === 0) return;
    const share = gl / (gl + gh);
    stretch(lo, scale(diff, share));
    stretch(hi, scale(diff, share - 1));
    next[hi] = next[lo];
  }

  const queue = units.map((_, i) => i);
  let waiting: number | null = null;

  while (queue.length || waiting !== null) {
    if (waiting !== null) {
      const s = state();
      const pair = bestPair(s.tops, s.gives, s.fresh);
      if (pair && pair.crop <= MAX_GIVE) {
        level(pair.col);
        put(waiting, pair.col, 2);
        waiting = null;
        continue;
      }
      // Try the next few photos on the shortest column; keep whichever gets a pair closest.
      const col = shortest(s.tops);
      const tries = queue.filter((i) => units[i].kind !== "wide").slice(0, LOOKAHEAD);
      if (!tries.length) {
        // Nothing left to level with: it goes in as an ordinary photo.
        put(waiting, col, 1);
        waiting = null;
        continue;
      }
      let pick = tries[0];
      let bestCrop = Infinity;
      for (const i of tries) {
        const h = px(natural(units[i], 1));
        const tops = s.tops.map((t, c) => (c === col ? t + h + GAP : t));
        const gives = s.gives.map((g, c) => (c === col ? g + h : g));
        const fresh = s.fresh.map((f, c) => f || c === col);
        const crop = bestPair(tops, gives, fresh)?.crop ?? Infinity;
        if (crop < bestCrop) [pick, bestCrop] = [i, crop];
      }
      queue.splice(queue.indexOf(pick), 1);
      put(pick, col, 1);
      continue;
    }

    const i = queue.shift()!;
    if (units[i].kind === "wide" && cols > 1) waiting = i;
    else put(i, shortest(state().tops), 1);
  }

  return { boxes, bottoms: next.map((l) => sub(l, [0, GAP])) };
}
