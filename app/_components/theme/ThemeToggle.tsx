"use client";

// A dot at rest. On hover (or keyboard focus) it grows into the current
// theme: a crescent in dark mode, a rayed sun in light mode. Springs with a
// little overshoot give the morph its organic feel. On touch there is no
// hover, so a tap flips the theme and shows the new state briefly.

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useTheme } from "./ThemeProvider";

type Shape = "dot" | "moon" | "sun";

const SHAPES = {
  dot: { disc: 2.6, bite: { cx: 31, cy: -7, r: 7 }, rays: [4, 4], rayOpacity: 0, rotate: 0 },
  moon: { disc: 8, bite: { cx: 17, cy: 7, r: 6.6 }, rays: [4, 4], rayOpacity: 0, rotate: -20 },
  sun: { disc: 4.6, bite: { cx: 31, cy: -7, r: 7 }, rays: [7.6, 10.4], rayOpacity: 1, rotate: 45 },
} as const;

const RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
const spring: Transition = { type: "spring", stiffness: 320, damping: 20, mass: 0.7 };

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const maskId = `tt-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [hover, setHover] = useState(false);
  const [peek, setPeek] = useState(false);
  const peekTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(peekTimer.current), []);

  const shape: Shape = hover || peek ? (theme === "dark" ? "moon" : "sun") : "dot";
  const s = SHAPES[shape];
  const t: Transition = reduce ? { duration: 0 } : spring;
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={className ? `theme-toggle ${className}` : "theme-toggle"}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHover(true)}
      onBlur={() => setHover(false)}
      onClick={(e) => {
        toggle();
        // Touch and pen have no hover state: show the new theme for a moment.
        if ((e.nativeEvent as PointerEvent).pointerType !== "mouse") {
          setPeek(true);
          clearTimeout(peekTimer.current);
          peekTimer.current = setTimeout(() => setPeek(false), 1400);
        }
      }}
    >
      <motion.svg viewBox="0 0 24 24" aria-hidden="true" initial={false} animate={{ rotate: s.rotate }} transition={t}>
        <defs>
          <mask id={maskId}>
            <rect x="-8" y="-8" width="40" height="40" fill="white" />
            <motion.circle fill="black" initial={false} animate={s.bite} transition={{ ...t, stiffness: 260 }} />
          </mask>
        </defs>
        <motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#${maskId})`} initial={false} animate={{ r: s.disc }} transition={t} />
        {RAYS.map((a, i) => (
          <motion.line
            key={i}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={false}
            animate={{
              x1: 12 + Math.cos(a) * s.rays[0],
              y1: 12 + Math.sin(a) * s.rays[0],
              x2: 12 + Math.cos(a) * s.rays[1],
              y2: 12 + Math.sin(a) * s.rays[1],
              opacity: s.rayOpacity,
            }}
            transition={reduce ? t : { ...spring, delay: shape === "sun" ? i * 0.018 : 0 }}
          />
        ))}
      </motion.svg>
    </button>
  );
}
