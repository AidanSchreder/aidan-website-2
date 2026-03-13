"use client";

/**
 * ThemeProvider
 *
 * Lifts dark/light mode state out of individual pages so it persists across
 * navigation. Reads/writes to localStorage under the key "theme".
 *
 * USAGE — wrap your app in app/layout.tsx alongside GridTransitionProvider:
 *
 *   import { ThemeProvider } from "@/components/ThemeProvider";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <ThemeProvider>
 *             <GridTransitionProvider>
 *               {children}
 *             </GridTransitionProvider>
 *           </ThemeProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * USAGE — in page.tsx and portfolio/page.tsx, replace local isDark state:
 *
 *   REMOVE:
 *     const [isDark, setIsDark] = useState(true);
 *
 *   ADD:
 *     import { useTheme } from "@/components/ThemeProvider";
 *     const { isDark, setIsDark } = useTheme();
 *
 * Everything else in your pages stays identical.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "theme";
const DEFAULT_DARK = true;

interface ThemeCtx {
  isDark: boolean;
  setIsDark: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: DEFAULT_DARK,
  setIsDark: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDarkState] = useState<boolean>(DEFAULT_DARK);
  const [hydrated, setHydrated]  = useState(false);

  // Read persisted preference on first mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsDarkState(stored === "dark");
      }
    } catch {
      // localStorage unavailable (SSR, private browsing edge cases) — use default
    }
    setHydrated(true);
  }, []);

  // Persist whenever the value changes
  const setIsDark = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsDarkState(prev => {
      const next = typeof value === "function" ? value(prev) : value;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  // Avoid a flash of wrong theme before localStorage is read.
  // Render children immediately (for SSR/hydration), but keep them hidden
  // until we've confirmed the correct theme. This prevents a layout shift
  // while keeping the DOM structure stable.
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div style={{ visibility: hydrated ? "visible" : "hidden" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
