"use client";

/**
 * GridTransitionProvider
 *
 * Drop-in page transition for Next.js App Router.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Wraps your entire app in layout.tsx (see usage below).
 * 2. Intercepts clicks on any <a> tag that points to an internal route.
 * 3. Plays a staggered 3D tile-flip OUT animation rippling from the click origin.
 * 4. Navigates once all tiles have flipped face-down (covering the screen).
 * 5. Plays a staggered 3D tile-flip IN animation rippling FROM the same
 *    viewport-relative origin point, revealing the new page beneath.
 *
 * USAGE — app/layout.tsx
 * ──────────────────────
 *   import { GridTransitionProvider } from "@/components/GridTransitionProvider";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <GridTransitionProvider>{children}</GridTransitionProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * TUNING
 * ──────
 *   CELL_SIZE   — pixel size of each square tile (default 80)
 *   MAX_STAGGER — maximum extra delay added to the furthest tile (ms, default 320)
 *   FLIP_MS     — duration of each individual tile flip (ms, default 420)
 *   HOLD_MS     — pause at full cover before navigating (ms, default 40)
 *
 * THEME
 * ─────
 *   Tiles read `--fg` and `--bg` from your CSS variables automatically,
 *   so they respect dark/light mode without any extra wiring.
 *   The tile FACE (visible when flipping in/out) uses `--fg`.
 *   The tile BACK is transparent, so the page shows through immediately.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// ── TUNING ────────────────────────────────────────────────────────────────────
const CELL_SIZE   = 80;   // px — tile size
const MAX_STAGGER = 300;  // ms — extra delay for the furthest tile
const FLIP_MS     = 400;  // ms — each tile's flip duration
const HOLD_MS     = 40;   // ms — pause at full coverage before navigating

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Phase = "idle" | "covering" | "covered" | "revealing" | "done";

interface TileState {
  row: number;
  col: number;
  delay: number;   // ms stagger before this tile starts flipping
  flip: boolean;   // true = animate this frame
}

interface TransitionCtx {
  navigate: (href: string, originX: number, originY: number) => void;
}

// ── CONTEXT ───────────────────────────────────────────────────────────────────
const Ctx = createContext<TransitionCtx>({ navigate: () => {} });
export const useGridTransition = () => useContext(Ctx);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function buildTiles(
  vpW: number,
  vpH: number,
  originX: number,
  originY: number
): TileState[] {
  const cols = Math.ceil(vpW / CELL_SIZE) + 1;
  const rows = Math.ceil(vpH / CELL_SIZE) + 1;

  // Furthest possible distance from origin to any tile centre
  const maxDist = Math.sqrt(
    Math.pow(Math.max(originX, vpW - originX), 2) +
    Math.pow(Math.max(originY, vpH - originY), 2)
  );

  const tiles: TileState[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * CELL_SIZE + CELL_SIZE / 2;
      const cy = r * CELL_SIZE + CELL_SIZE / 2;
      const dist = Math.sqrt(Math.pow(cx - originX, 2) + Math.pow(cy - originY, 2));
      const delay = (dist / maxDist) * MAX_STAGGER;
      tiles.push({ row: r, col: c, delay, flip: false });
    }
  }
  return tiles;
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────
export function GridTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  const [phase,    setPhase]    = useState<Phase>("idle");
  const [tiles,    setTiles]    = useState<TileState[]>([]);
  const [vpSize,   setVpSize]   = useState({ w: 0, h: 0 });
  const [origin,   setOrigin]   = useState({ x: 0, y: 0 });
  const [cols,     setCols]     = useState(0);

  // Keep pending href and origin stable across async steps
  const pendingHref   = useRef<string>("");
  const pendingOrigin = useRef({ x: 0, y: 0 });
  const isNavigating  = useRef(false);

  // ── Navigate entry point ───────────────────────────────────────────────────
  const navigate = useCallback(
    (href: string, originX: number, originY: number) => {
      if (isNavigating.current) return;
      isNavigating.current = true;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      pendingHref.current   = href;
      pendingOrigin.current = { x: originX, y: originY };

      const newTiles = buildTiles(vpW, vpH, originX, originY);
      const newCols  = Math.ceil(vpW / CELL_SIZE) + 1;

      setVpSize({ w: vpW, h: vpH });
      setOrigin({ x: originX, y: originY });
      setTiles(newTiles);
      setCols(newCols);
      setPhase("covering");
    },
    []
  );

  // ── Phase: covering → covered ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "covering") return;

    // The last tile to finish = MAX_STAGGER + FLIP_MS after the click
    const totalCoverMs = MAX_STAGGER + FLIP_MS + HOLD_MS;

    const id = setTimeout(() => {
      // Navigate — the new page mounts under the tiles
      router.push(pendingHref.current);
      setPhase("covered");
    }, totalCoverMs);

    return () => clearTimeout(id);
  }, [phase, router]);

  // ── Phase: covered → revealing (triggered by route change) ────────────────
  useEffect(() => {
    if (phase !== "covered") return;

    // Give Next.js one tick to commit the new page to the DOM, then reveal
    const id = setTimeout(() => {
      // Rebuild tiles rippling FROM the same viewport origin
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const ox  = pendingOrigin.current.x;
      const oy  = pendingOrigin.current.y;

      const revealTiles = buildTiles(vpW, vpH, ox, oy);
      setTiles(revealTiles);
      setPhase("revealing");
    }, 60);

    return () => clearTimeout(id);
  }, [pathname, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase: revealing → done ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "revealing") return;

    const totalRevealMs = MAX_STAGGER + FLIP_MS + 100;
    const id = setTimeout(() => {
      setPhase("done");
      isNavigating.current = false;
    }, totalRevealMs);

    return () => clearTimeout(id);
  }, [phase]);

  // ── Cleanup to idle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "done") {
      // Small buffer so the last tile finishes visually
      const id = setTimeout(() => setPhase("idle"), 100);
      return () => clearTimeout(id);
    }
  }, [phase]);

  // ── Intercept <a> clicks globally ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only intercept same-origin internal links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        href.startsWith("#")
      ) return;

      // Don't intercept if already on that page
      if (href === pathname) return;

      e.preventDefault();
      navigate(href, e.clientX, e.clientY);
    };

    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, [navigate, pathname]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const isActive = phase === "covering" || phase === "covered" || phase === "revealing";

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}

      {isActive && (
        <div
          aria-hidden="true"
          style={{
            position:      "fixed",
            inset:         0,
            zIndex:        9999,
            pointerEvents: "none",
            overflow:      "hidden",
          }}
        >
          {tiles.map((tile) => {
            const isCovering  = phase === "covering";
            const isRevealing = phase === "revealing";

            /**
             * FLIP MECHANIC
             * ─────────────
             * Each tile is a square with perspective. It has a single visible
             * face coloured `--fg`. In cover phase it flips from rotateY(90deg)
             * (edge-on = invisible) → rotateY(0deg) (face-on = blocks the page).
             * In reveal phase it flips from rotateY(0deg) → rotateY(-90deg).
             *
             * We apply the transition only during active phases; during "covered"
             * tiles sit at rotateY(0) with no transition so they hold position.
             */
            let rotateY = "rotateY(90deg)";      // default: edge-on (hidden)
            if (phase === "covered") rotateY = "rotateY(0deg)";
            if (isRevealing)         rotateY = "rotateY(0deg)"; // start, will animate

            // For reveal we need tiles to animate FROM 0 → -90, so we force
            // a reflow trick via a CSS animation instead of a transition so
            // the start state doesn't collapse. We use animationName to signal.
            const animationName = isRevealing
              ? `tile-reveal-${tile.row}-${tile.col}`
              : undefined;

            return (
              <div
                key={`${tile.row}-${tile.col}`}
                style={{
                  position:   "absolute",
                  left:       tile.col * CELL_SIZE,
                  top:        tile.row * CELL_SIZE,
                  width:      CELL_SIZE,
                  height:     CELL_SIZE,
                  perspective: CELL_SIZE * 3,
                }}
              >
                <div
                  style={{
                    width:           "100%",
                    height:          "100%",
                    background:      "var(--fg, #111)",
                    transformOrigin: (() => {
                      // Tiles closer to origin flip from the near edge
                      // creating a more organic, directional ripple.
                      const cx = tile.col * CELL_SIZE + CELL_SIZE / 2;
                      const cy = tile.row * CELL_SIZE + CELL_SIZE / 2;
                      const fromLeft = cx < origin.x;
                      const fromTop  = cy < origin.y;
                      return `${fromLeft ? "right" : "left"} ${fromTop ? "bottom" : "top"}`;
                    })(),

                    // Covering: tiles animate in with a staggered delay
                    animation: isCovering
                      ? `tile-cover ${FLIP_MS}ms cubic-bezier(0.4,0,0.2,1) ${tile.delay}ms both`
                      : isRevealing
                      ? `tile-reveal ${FLIP_MS}ms cubic-bezier(0.4,0,0.2,1) ${tile.delay}ms both`
                      : "none",

                    // Hold state between phases
                    transform: (!isCovering && !isRevealing) ? "rotateX(0deg) rotateY(0deg)" : undefined,
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Keyframes injected as a style tag */}
      <style>{`
        @keyframes tile-cover {
          from {
            transform: rotateY(90deg) scale(0.85);
            opacity: 0;
          }
          to {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes tile-reveal {
          from {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          to {
            transform: rotateY(-90deg) scale(0.85);
            opacity: 0;
          }
        }
      `}</style>
    </Ctx.Provider>
  );
}
