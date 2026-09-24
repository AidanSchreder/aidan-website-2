import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";

// Link-preview cards, one per landing page, each in that page's own style.
// They are generated at build time (static routes), so reading /public and
// resizing with sharp here costs nothing at request time.
//
// Every page imports the root opengraph-image for its metadata, so a /public
// path the bundler can't resolve here gets all of /public (3D models included)
// copied into every server function. `turbopackIgnore` stops that; the
// background is only read during the build.

export const OG_SIZE = { width: 1200, height: 630 };

const fontCache = new Map<string, Promise<Buffer>>();
function font(file: string) {
  if (!fontCache.has(file)) fontCache.set(file, readFile(path.join(process.cwd(), "app/_fonts", file)));
  return fontCache.get(file)!;
}

async function background(src: string) {
  const buf = await sharp(path.join(/* turbopackIgnore: true */ process.cwd(), "public", src)).rotate().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

interface Card {
  kicker: string;
  lines: string[];
  footer: string;
  bg: string;
  fg: string;
  muted: string;
  /** CSS gradient layers drawn over the background (grids, washes). */
  pattern?: string;
  patternSize?: string;
  image?: string;
  imageWash?: string;
}

export async function ogCard(c: Card) {
  const img = c.image ? await background(c.image) : null;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: c.bg,
          color: c.fg,
          position: "relative",
          fontFamily: "Bank Gothic",
        }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630 }} />
        )}
        {img && c.imageWash && <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: c.imageWash }} />}
        {c.pattern && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              backgroundImage: c.pattern,
              backgroundSize: c.patternSize,
            }}
          />
        )}
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, textTransform: "uppercase", color: c.muted }}>{c.kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Prodes", fontSize: 118, lineHeight: 0.9, textTransform: "uppercase" }}>
          {c.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: c.muted }}>{c.footer}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Bank Gothic", data: await font("Bank Gothic Light Regular.otf"), style: "normal", weight: 400 },
        { name: "Prodes", data: await font("ProdesStencil-Regular.ttf"), style: "normal", weight: 400 },
      ],
    },
  );
}

export const grid = (color: string, size = 60) => ({
  pattern: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
  patternSize: `${size}px ${size}px`,
});
