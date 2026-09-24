// Colours for the design section's grain shapes (header and footer).
//
// The stops are written as one warm-to-cool family, then every colour is
// turned around the colour wheel by HUE_SHIFT degrees. The turn happens in
// OKLCH, which keeps each colour's lightness and chroma, so the gradients
// blend exactly as before and only the hue family changes. Change HUE_SHIFT
// to move the whole palette at once.

import type { GrainFill } from "./Grain";

// Magenta/blue: -58, Purple/green: -108, Blue/green: -138, Teal/yellow: -188, Turqouise/orange: -218, 
export const HUE_SHIFT = -108;

// sRGB ↔ OKLab (Björn Ottosson's matrices).
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab([r, g, b]: number[]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: number[]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Turns a colour's hue, keeping lightness; chroma is eased back only if the result leaves sRGB. */
export function shiftHue(hex: string, degrees: number) {
  const lin = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const [L, a, b] = toOklab(lin);
  const C = Math.hypot(a, b);
  const h = Math.atan2(b, a) + (degrees * Math.PI) / 180;
  const at = (c: number) => fromOklab([L, c * Math.cos(h), c * Math.sin(h)]);
  const fits = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let out = at(C);
  if (!fits(out)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (fits(at(mid))) lo = mid;
      else hi = mid;
    }
    out = at(lo);
  }
  return `#${out.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

const shifted = (fill: GrainFill): GrainFill => ({
  ...fill,
  stops: fill.stops.map(([at, hex]) => [at, shiftHue(hex, HUE_SHIFT)]),
});

/** Large shape behind the name: bright corner dissolving to sparse dark grain. */
export const MAIN = shifted({
  stops: [
    [0, "#ffb35c"],
    [0.35, "#f9693a"],
    [0.7, "#c8422c"],
    [1, "#3a2418"],
  ],
  angle: 225,
  fade: { angle: 225, to: 0.08 },
});

/** Three-colour sweep, warm to cool. */
export const SWEEP = shifted({
  stops: [
    [0, "#f6c14b"],
    [0.45, "#e9573a"],
    [1, "#3b79c9"],
  ],
  angle: 90,
  fade: { angle: 320, to: 0.3 },
});

/** Two-colour diagonal, warm to cool. */
export const DUO = shifted({
  stops: [
    [0, "#ec5530"],
    [1, "#3d84d2"],
  ],
  angle: 45,
  fade: { angle: 135, to: 0.12 },
});
