"use client";

import { useEffect, useRef } from "react";
import { trackView, type TrackItem } from "./track";

/**
 * Records a "view" once an element has been meaningfully on screen for
 * `ms` milliseconds: at least 60% of it visible, or (for tall elements)
 * at least half the viewport filled by it. Fires once per page load.
 */
export function useDwell<T extends Element>(item: TrackItem | null, ms = 1500) {
  const ref = useRef<T>(null);
  const key = item ? `${item.section}:${item.id}` : null;
  const itemRef = useRef(item);
  useEffect(() => {
    itemRef.current = item;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !key) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        const seen =
          entry.isIntersecting &&
          (entry.intersectionRatio >= 0.6 || entry.intersectionRect.height >= window.innerHeight * 0.5);
        clearTimeout(timer);
        if (seen) {
          timer = setTimeout(() => {
            if (itemRef.current) trackView(itemRef.current);
            io.disconnect();
          }, ms);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.8, 1] },
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [key, ms]);

  return ref;
}
