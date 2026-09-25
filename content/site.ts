// Site-wide identity, links and section registry.
// Adding a section later (e.g. architecture) = add an entry to SECTIONS,
// create app/<slug>/ (and app/<slug>/about/), and it appears in the lobby,
// sitemap and analytics.

// The host Vercel serves: aidanschreder.com redirects to www. Canonical tags,
// the sitemap and link previews all use this, so it must match that redirect
// (Vercel → Domains); a mismatch leaves search engines with two versions of
// every page.
export const SITE_URL = "https://www.aidanschreder.com";
export const NAME = "Aidan Schreder";
export const EMAIL = "aidan.schreder@gmail.com";

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/aidan-schreder",
  github: "https://github.com/AidanSchreder",
  // Mechatronics portfolio PDF. Its old URL, /tron-portfolio.pdf, is on
  // résumés already and redirects here (next.config.ts).
  portfolioPdf: "/engineering/documents/tron-portfolio.pdf",
  icraPaper: "/engineering/documents/ICRA-paper.pdf",
  // Drop the file at public/engineering/documents/resume.pdf; the engineering
  // page shows the link automatically once it exists.
  resume: "/engineering/documents/resume.pdf",
} as const;

export type SectionId = "lobby" | "engineering" | "design" | "photography" | "3d";

export interface Section {
  id: SectionId;
  href: string;
  label: string;
  /** Short descriptor used on the lobby doors. */
  blurb: string;
  /** Theme for first-time visitors. A visitor's own toggle choice wins. */
  defaultTheme: "dark" | "light";
  /** One-line contact prompt; the email address follows it. */
  contact: string;
  /** Pre-filled subject so inquiries arrive sorted by door. */
  subject: string;
  /** Inquiry address for this section, if not the default EMAIL. */
  email?: string;
  /** The section's own about page, styled like the section. */
  about?: string;
  /**
   * false = kept out of search engines (noindex + left out of the sitemap).
   * The pages still work for anyone given the link.
   */
  searchable?: boolean;
}

export const SECTIONS: Section[] = [
  {
    id: "engineering",
    href: "/engineering",
    label: "Engineering",
    blurb: "Robotics, CAD, research, software",
    defaultTheme: "dark",
    contact: "For co-op, internship or research roles:",
    subject: "Engineering inquiry",
    email: "aschrede@uwaterloo.ca",
    about: "/engineering/about",
    // Shared directly with recruiters (résumé, LinkedIn); not listed in search.
    searchable: false,
  },
  {
    id: "design",
    href: "/design",
    label: "Design",
    blurb: "Logos and brand identity",
    defaultTheme: "dark",
    contact: "For logo and identity work:",
    subject: "Design inquiry",
    about: "/design/about",
  },
  {
    id: "photography",
    href: "/photography",
    label: "Photography",
    blurb: "Streets, interiors, night",
    defaultTheme: "light",
    contact: "For shoots or licensing:",
    subject: "Photography inquiry",
    about: "/photography/about",
  },
  {
    id: "3d",
    href: "/3d",
    label: "3D",
    blurb: "Blender scenes, models, animation",
    defaultTheme: "dark",
    contact: "For renders and 3D work:",
    subject: "3D inquiry",
    about: "/3d/about",
  },
];

const PAGES: Section[] = [
  ...SECTIONS,
  {
    id: "lobby",
    href: "/",
    label: "Home",
    blurb: "",
    defaultTheme: "dark",
    contact: "Contact:",
    subject: "Hello",
  },
];

export function sectionFor(pathname: string): Section {
  return (
    PAGES.find((p) => p.href !== "/" && (pathname === p.href || pathname.startsWith(p.href + "/"))) ??
    PAGES[PAGES.length - 1]
  );
}

export function page(id: SectionId): Section {
  return PAGES.find((p) => p.id === id)!;
}

/** Robots metadata for a section's layout: noindex when it is kept out of search. */
export function sectionRobots(id: SectionId) {
  return page(id).searchable === false ? { index: false, follow: false } : undefined;
}

export function emailFor(id: SectionId): string {
  return page(id).email ?? EMAIL;
}

export function mailto(id: SectionId): string {
  return `mailto:${emailFor(id)}?subject=${encodeURIComponent(page(id).subject)}`;
}
