"use client";

// A collection grid whose viewer state lives in the URL hash
// (/photography/quebec-night#01_home.jpg). That makes every photo linkable,
// lets the collage deep-link straight into the viewer, and makes the browser
// back button close the viewer on phones.

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import { Lightbox } from "../../_components/Lightbox";
import { trackOpen } from "../../_lib/track";
import { Masonry } from "../Masonry";
import { single, type Tile } from "../units";

const HASH_EVENT = "photo-hash";
// Collections keep their filename order, with a fixed gentle stagger.
const OFFSETS = [0, 64, 24];

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  window.addEventListener(HASH_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener(HASH_EVENT, cb);
  };
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

function setHash(file: string | null, push: boolean) {
  const url = file ? `#${encodeURIComponent(file)}` : window.location.pathname;
  if (push) window.history.pushState(null, "", url);
  else window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(HASH_EVENT));
}

export function CollectionView({ title, tiles }: { title: string; tiles: (Tile & { caption: string | null })[] }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const index = tiles.findIndex((t) => t.file === hash);
  const pushed = useRef(false);
  const seen = useRef(new Set<string>());

  // Every photo shown large counts as an "open" (once per page load).
  useEffect(() => {
    const t = tiles[index];
    if (!t || seen.current.has(t.id)) return;
    seen.current.add(t.id);
    trackOpen({ section: "photography", id: t.id, title: `${t.title} · ${t.file}`, thumb: t.src, href: `/photography/${t.slug}#${encodeURIComponent(t.file)}` });
  }, [index, tiles]);

  const units = useMemo(() => tiles.map(single), [tiles]);

  const open = useCallback((t: Tile) => {
    pushed.current = true;
    setHash(t.file, true);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      setHash(null, false);
    }
  }, []);

  return (
    <>
      <Masonry units={units} offsets={OFFSETS} onOpen={open} />
      <AnimatePresence>
        {index >= 0 && (
          <Lightbox
            key="viewer"
            title={title}
            items={tiles.map((t) => ({ src: t.src, caption: t.caption, blur: t.blur }))}
            index={index}
            onIndex={(i) => setHash(tiles[i].file, false)}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
}
