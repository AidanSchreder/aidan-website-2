import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import { LINKS } from "@/content/site";

/** True once public/resume.pdf exists. Evaluated at build for static pages. */
export function hasResume() {
  return existsSync(path.join(process.cwd(), "public", LINKS.resume.slice(1)));
}

export function engineeringLinks() {
  return [
    hasResume() && { label: "Résumé", href: LINKS.resume },
    { label: "LinkedIn", href: LINKS.linkedin },
    { label: "GitHub", href: LINKS.github },
    { label: "Portfolio PDF", href: LINKS.portfolioPdf },
  ].filter(Boolean) as { label: string; href: string }[];
}
