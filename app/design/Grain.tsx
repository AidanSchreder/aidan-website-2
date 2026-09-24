"use client";

// A gradient drawn as grain: every dot is either the gradient's colour or
// empty, and the dots thin out along `fade`. Painted to a canvas at the
// screen's real pixel density (one dot per device pixel, or 2×2 on 2× screens)
// and cut to a shape with a signed-distance test, so any shape stays crisp at
// any size and costs no image bytes.
//
// Resizing: each dot's randomness is hashed from its position relative to the
// shape's centre, so a repaint at a new size keeps the same grain instead of
// reshuffling it; and the repaint runs inside the ResizeObserver callback,
// which lands before the browser paints, so a stretched old bitmap never shows.

import { useEffect, useRef } from "react";

export interface GrainFill {
  /** Colour stops, 0–1 along `angle`. */
  stops: [number, string][];
  /** CSS gradient angle: 0 = toward the top, 90 = toward the right. */
  angle: number;
  /** Direction the dots thin out in, and how sparse they get at the far end (0–1). */
  fade: { angle: number; to: number };
}

/** `round` is the corner radius as a fraction of the shape's size. */
export type GrainShape = { kind: "circle" } | { kind: "rect"; round: number } | { kind: "triangle"; round: number };

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** 32-bit hash of a dot's position; stable across repaints and sizes. */
function hash(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Signed distance (px) from a w×h rounded rectangle's edge; negative inside. */
function roundRect(w: number, h: number, round: number) {
  const rad = round * Math.min(w, h);
  const bx = w / 2 - rad;
  const by = h / 2 - rad;
  return (x: number, y: number) => {
    const qx = Math.abs(x) - bx;
    const qy = Math.abs(y) - by;
    const ox = Math.max(qx, 0);
    const oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - rad;
  };
}

/** Signed distance (px) from the shape's edge; negative inside. Coordinates are from the centre. */
function distance(shape: GrainShape, w: number, h: number) {
  if (shape.kind === "circle") {
    const r = Math.min(w, h) / 2;
    return (x: number, y: number) => Math.hypot(x, y) - r;
  }
  if (shape.kind === "rect") return roundRect(w, h, shape.round);
  // Equilateral triangle pointing up, as wide as the box (Inigo Quilez's
  // sdEquilateralTriangle), shrunk and then padded by `rad` for round corners.
  const k = Math.sqrt(3);
  const half = w / 2;
  const rad = shape.round * w;
  const r = half - rad * k;
  const lift = (half * k) / 6; // centroid sits below the box centre
  return (x: number, y: number) => {
    let px = Math.abs(x) - r;
    let py = -(y - lift) + r / k;
    if (px + k * py > 0) [px, py] = [(px - k * py) / 2, (-k * px - py) / 2];
    px -= Math.min(Math.max(px, -2 * r), 0);
    return -Math.hypot(px, py) * Math.sign(py) - rad;
  };
}

function paint(canvas: HTMLCanvasElement, w: number, h: number, scale: number, fill: GrainFill, shape: GrainShape, seed: number) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // One dot per device pixel, or 2×2 on 2× screens so the grain reads the same.
  // `scale` is measured (bitmap px per CSS px), not taken from devicePixelRatio,
  // so the two can't disagree.
  const dot = Math.max(1, Math.round(scale));

  // Gradient colour lookup, 256 steps.
  const stops = fill.stops.map(([at, hex]) => [at, ...rgb(hex)] as const);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0, s = 1; i < 256; i++) {
    const t = i / 255;
    while (s < stops.length - 1 && t > stops[s][0]) s++;
    const [a0, ...c0] = stops[s - 1];
    const [a1, ...c1] = stops[s];
    const k = Math.min(1, Math.max(0, (t - a0) / (a1 - a0 || 1)));
    for (let j = 0; j < 3; j++) lut[i * 3 + j] = c0[j] + (c1[j] - c0[j]) * k;
  }
  // Position along a CSS-style gradient line, as a linear function of (x, y) from the centre.
  const line = (angle: number) => {
    const a = (angle * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const len = Math.abs(w * dx) + Math.abs(h * dy);
    return [dx / len, dy / len] as const;
  };
  const [cx, cy] = line(fill.angle);
  const [fx, fy] = line(fill.fade.angle);
  const sparse = 1 - fill.fade.to;
  const edge = distance(shape, w, h);

  const img = ctx.createImageData(w, h);
  const px = img.data;
  const ox = Math.round(w / 2);
  const oy = Math.round(h / 2);
  for (let j = -Math.ceil(oy / dot); j * dot < h - oy; j++) {
    for (let i = -Math.ceil(ox / dot); i * dot < w - ox; i++) {
      const x = i * dot + dot / 2;
      const y = j * dot + dot / 2;
      if (edge(x + ox - w / 2, y + oy - h / 2) > 0) continue;
      const r = hash(i, j, seed);
      const f = Math.min(1, Math.max(0, (x * fx + y * fy + 0.5 - 0.2) / 0.8));
      if ((r & 0xffff) / 65536 > 1 - sparse * f * f * (3 - 2 * f)) continue;
      const t = Math.min(255, Math.max(0, Math.round((x * cx + y * cy + 0.5) * 255))) * 3;
      const jitter = 0.86 + ((r >>> 16) & 0xff) / 910;
      const R = lut[t] * jitter;
      const G = lut[t + 1] * jitter;
      const B = lut[t + 2] * jitter;
      for (let yy = Math.max(0, oy + j * dot); yy < Math.min(h, oy + (j + 1) * dot); yy++) {
        for (let xx = Math.max(0, ox + i * dot); xx < Math.min(w, ox + (i + 1) * dot); xx++) {
          const o = (yy * w + xx) * 4;
          px[o] = R;
          px[o + 1] = G;
          px[o + 2] = B;
          px[o + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function Grain({
  fill,
  shape,
  seed = 1,
  className,
}: {
  fill: GrainFill;
  shape: GrainShape;
  seed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const props = useRef({ fill, shape });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let last = "";
    const ro = new ResizeObserver(([entry]) => {
      // Exact device pixels where the browser reports them (not Safari).
      const device = entry.devicePixelContentBoxSize?.[0];
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, device ? device.inlineSize : Math.round(entry.contentRect.width * dpr));
      const h = Math.max(1, device ? device.blockSize : Math.round(entry.contentRect.height * dpr));
      const size = `${w}x${h}`;
      if (size === last || !entry.contentRect.width) return;
      last = size;
      paint(canvas, w, h, w / entry.contentRect.width, props.current.fill, props.current.shape, seed);
    });
    try {
      ro.observe(canvas, { box: "device-pixel-content-box" });
    } catch {
      ro.observe(canvas);
    }
    return () => ro.disconnect();
  }, [seed]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
