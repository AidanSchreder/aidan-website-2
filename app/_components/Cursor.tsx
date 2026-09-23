"use client";

// Custom cursor for the expressive sections (design, 3D). A dot that tracks
// the pointer exactly, and a ring that follows on a spring. Over links and
// buttons the ring widens; over anything with data-cursor="Label" it grows
// into a disc carrying that label. Mouse/trackpad only, and off entirely for
// reduced-motion users.

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<{ label: string | null; hot: boolean }>({ label: null, hot: false });
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 420, damping: 36, mass: 0.5 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("custom-cursor");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const labelled = el?.closest<HTMLElement>("[data-cursor]");
      setMode({ label: labelled?.dataset.cursor ?? null, hot: !!el?.closest("a, button") });
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    // Enabling is a response to the environment check above, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;
  const size = mode.label ? 84 : mode.hot ? 44 : 30;

  return (
    <>
      <motion.div className="cursor-ring" style={{ x: rx, y: ry }} aria-hidden="true">
        <motion.div
          className="cursor-ring-inner"
          data-label={mode.label ? "" : undefined}
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {mode.label && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
              {mode.label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      <motion.div className="cursor-dot" style={{ x, y }} animate={{ scale: mode.label ? 0 : 1 }} aria-hidden="true" />
    </>
  );
}
