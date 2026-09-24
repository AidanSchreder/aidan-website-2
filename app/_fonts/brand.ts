// Shared across every page: the stencil wordmark face and the mono label face.
// Each section adds its own faces from a sibling file so a page only preloads
// the fonts it actually uses.

import localFont from "next/font/local";
import { Space_Mono } from "next/font/google";

export const prodes = localFont({
  src: "./ProdesStencil-Regular.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});
