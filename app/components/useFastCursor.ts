"use client";

/**
 * useFastCursor
 *
 * Drives the custom cursor via direct DOM manipulation rather than React state,
 * eliminating the re-render bottleneck on every mousemove event.
 *
 * HOW TO USE — in page.tsx and portfolio/page.tsx:
 *
 *   STEP 1 — Import the hook:
 *     import { useFastCursor } from "@/components/useFastCursor";
 *
 *   STEP 2 — Replace the old cursor state and effect:
 *
 *     REMOVE these lines:
 *       const [mouseX, setMouseX]               = useState(0);
 *       const [mouseY, setMouseY]               = useState(0);
 *       const [cursorVisible, setCursorVisible] = useState(false);
 *
 *     REMOVE the cursor-related lines inside your existing useEffect:
 *       const onMouse      = (e: MouseEvent) => { setMouseX(...); setMouseY(...); setCursorVisible(true); };
 *       const onMouseLeave = () => setCursorVisible(false);
 *       window.addEventListener("mousemove", onMouse);
 *       document.body.addEventListener("mouseleave", onMouseLeave);
 *       (and the corresponding removeEventListeners)
 *
 *     ADD this line near the top of your component:
 *       const { dotRef, ringRef } = useFastCursor();
 *
 *   STEP 3 — Update the cursor JSX.
 *
 *     REPLACE:
 *       <div className="cursor"      style={{ left: mouseX - 6,  top: mouseY - 6,  opacity: cursorVisible ? 1 : 0, position: "fixed" }} />
 *       <div className="cursor-ring" style={{ left: mouseX - 20, top: mouseY - 20, opacity: cursorVisible ? 1 : 0, position: "fixed" }} />
 *
 *     WITH:
 *       <div className="cursor"      ref={dotRef}  />
 *       <div className="cursor-ring" ref={ringRef} />
 *
 *   STEP 4 — Update the CSS for the cursor-ring. The old CSS used a transition
 *     on `left` and `top` to create the lag effect. Replace it with
 *     `transform` so the GPU handles movement (much smoother):
 *
 *     .cursor-ring {
 *       position: fixed;
 *       width: 40px; height: 40px;
 *       border: 1px solid rgba(128,128,128,0.5);
 *       border-radius: 50%;
 *       pointer-events: none;
 *       z-index: 9998;
 *       mix-blend-mode: difference;
 *       top: 0; left: 0;                          ← anchor to top-left corner
 *       transform: translate(-20px, -20px);        ← visual offset (half of 40px)
 *       transition: transform 0.10s linear;        ← smooth follow on transform
 *       will-change: transform;
 *     }
 *
 *     .cursor {
 *       position: fixed;
 *       width: 12px; height: 12px;
 *       background: var(--fg);
 *       border-radius: 50%;
 *       pointer-events: none;
 *       z-index: 9999;
 *       mix-blend-mode: difference;
 *       top: 0; left: 0;                          ← anchor to top-left corner
 *       transform: translate(-6px, -6px);          ← visual offset (half of 12px)
 *       will-change: transform;
 *     }
 *
 * WHY THIS IS FASTER
 * ──────────────────
 * The old implementation stored mouse position in React state, causing a full
 * React re-render (diff + commit) on every mousemove event — up to 120 times
 * per second on high-refresh displays. This hook bypasses React entirely:
 * position updates go straight to element.style.transform in the mousemove
 * handler, which the browser composites on the GPU without touching the JS heap.
 * The ring uses CSS `transition: transform` for its follow-delay instead of
 * JS lag, which is also GPU-composited.
 */

import { useEffect, useRef } from "react";

export function useFastCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Start hidden
    dot.style.opacity  = "0";
    ring.style.opacity = "0";

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Move dot instantly — no transition needed, it IS the pointer
      dot.style.transform  = `translate(calc(${x}px - 6px),  calc(${y}px - 6px))`;

      // Ring follows with a CSS transition on transform (set in stylesheet)
      ring.style.transform = `translate(calc(${x}px - 20px), calc(${y}px - 20px))`;

      dot.style.opacity  = "1";
      ring.style.opacity = "1";
    };

    const onLeave = () => {
      dot.style.opacity  = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.body.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return { dotRef, ringRef };
}
