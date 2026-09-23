"use client";

// Theme state lives on <html data-theme>. An inline script in app/layout.tsx
// sets it before first paint (no flash, no hidden-until-hydrated page); this
// provider mirrors the attribute into React and applies per-page defaults on
// client navigation for visitors who have never toggled.

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { sectionFor } from "@/content/site";

export type Theme = "dark" | "light";
const STORAGE_KEY = "theme";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function syncChromeColor() {
  // Mobile browser UI colour follows the resolved section background.
  requestAnimationFrame(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (!bg) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = bg;
  });
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  syncChromeColor();
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const getServerSnapshot = (): Theme => "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    apply(readStored() ?? sectionFor(pathname).defaultTheme);
  }, [pathname]);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
