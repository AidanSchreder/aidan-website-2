"use client";

// A card's hover preview: a short silent loop over its still. It plays while
// the pointer is over the card (on touch screens, while the card is mostly on
// screen), fades in only once frames are actually playing, and starts from the
// top each time. Nothing loads until the card nears the screen, and nothing
// plays for reduced motion or Data Saver.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "../three-d.module.css";

/** Matches the fade in three-d.module.css (.preview). */
const FADE_MS = 400;

const HOVER = "(hover: hover)";
function subscribeHover(cb: () => void) {
  const mq = window.matchMedia(HOVER);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const saveData = () =>
  typeof navigator !== "undefined" && !!(navigator as { connection?: { saveData?: boolean } }).connection?.saveData;

export function HoverVideo({ src, hovered, stopped }: { src: string; hovered: boolean; stopped: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const canHover = useSyncExternalStore(subscribeHover, () => window.matchMedia(HOVER).matches, () => true);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start fetching a little before the card arrives, so a hover starts promptly.
    const approach = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" });
    // Touch screens have no hover: play while the card is mostly on screen.
    const view = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.6), { threshold: [0, 0.6] });
    approach.observe(el);
    view.observe(el);
    return () => {
      approach.disconnect();
      view.disconnect();
    };
  }, []);

  const allowed = !reduce && !saveData();
  const active = allowed && !stopped && (canHover ? hovered : inView);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
      return;
    }
    v.pause();
    // Rewind once it has faded out, so the next hover begins at the top.
    const t = setTimeout(() => v.paused && (v.currentTime = 0), FADE_MS);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <>
      <video
        ref={ref}
        className={styles.preview}
        src={src}
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload={allowed && near ? "auto" : "none"}
        aria-hidden="true"
        tabIndex={-1}
        data-playing={playing || undefined}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {/* Says "this one moves" at rest; gets out of the way once it does. */}
      <span className={styles.moving} data-playing={playing || undefined} aria-hidden="true">
        <svg viewBox="0 0 10 10">
          <path d="M3 2l5 3-5 3z" />
        </svg>
      </span>
    </>
  );
}
