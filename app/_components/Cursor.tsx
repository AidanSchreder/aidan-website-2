"use client";

// Custom cursor for the expressive sections (design, 3D). A dot that tracks
// the pointer exactly, and a ring that follows on a spring. Over links and
// buttons the ring widens; over anything with data-cursor="Label" it grows
// into a disc carrying that label; over a text field the dot stretches into
// an I-beam as tall as the field's text and the ring slims to a faint capsule
// around it. Mouse/trackpad only, and off entirely for reduced-motion users.

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<{ label: string | null; hot: boolean; caret: number | null }>({ label: null, hot: false, caret: null });
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
      const field = el?.closest<HTMLElement>("textarea, input:is([type=text], [type=email], [type=search], :not([type]))");
      const caret = field ? Math.round(Math.min(44, Math.max(14, parseFloat(getComputedStyle(field).fontSize) * 1.2))) : null;
      setMode({ label: labelled?.dataset.cursor ?? null, hot: !!el?.closest("a, button"), caret });
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
  const morph = { type: "spring", stiffness: 420, damping: 32 } as const;
  const ring = mode.caret
    ? { width: 14, height: mode.caret + 14, borderRadius: 7, opacity: 0.35 }
    : { width: size, height: size, borderRadius: size / 2, opacity: 1 };
  const dot = mode.caret
    ? { width: 2, height: mode.caret, borderRadius: 1, scale: 1 }
    : { width: 8, height: 8, borderRadius: 4, scale: mode.label ? 0 : 1 };

  return (
    <>
      <motion.div className="cursor-ring" style={{ x: rx, y: ry }} aria-hidden="true">
        <motion.div
          className="cursor-ring-inner"
          data-label={mode.label ? "" : undefined}
          initial={false}
          animate={ring}
          transition={morph}
        >
          {mode.label && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
              {mode.label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        className="cursor-dot"
        data-caret={mode.caret ? "" : undefined}
        style={{ x, y }}
        initial={false}
        animate={dot}
        transition={morph}
        aria-hidden="true"
      />
    </>
  );
}
