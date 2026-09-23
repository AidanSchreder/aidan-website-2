// Shared by the server (collage/collection pages) and the client masonry,
// so it must not live in a "use client" module.

export interface Tile {
  id: string;
  slug: string;
  file: string;
  title: string;
  src: string;
  width: number;
  height: number;
  blur: string;
  alt: string;
}

/** A slot in the masonry: one photo, or two nested side by side. */
export type Unit = { kind: "single"; tile: Tile } | { kind: "pair"; tiles: [Tile, Tile] };

export const single = (tile: Tile): Unit => ({ kind: "single", tile });
