import type { NextConfig } from "next";

// Where files lived before public/ was organised by section, then by type.
// The numbered folders were portfolio pieces; each is now named after its id.
const PORTFOLIO: Record<string, string> = {
  "01": "3d/images/evacuation",
  "02": "design/images/spright-games",
  "03": "design/images/stem-4-all",
  "04": "design/images/iron-bears",
  "05": "design/images/tedx-youth",
  "06": "design/images/relay-for-life",
  "07": "3d/images/a-shallow-past",
  "08": "3d/images/spring-morning",
  "09": "3d/images/orbital-ship",
  "10": "3d/images/machine-replication-horizon",
  "15": "3d/images/research-and-sample-pod-13",
  "21": "design/images/can-rgx",
};
const MOVED = [
  { source: "/tron-portfolio.pdf", destination: "/engineering/documents/tron-portfolio.pdf" },
  { source: "/ICRA-paper.pdf", destination: "/engineering/documents/ICRA-paper.pdf" },
  { source: "/images/engineering/icra-haptics/:file", destination: "/engineering/images/haptic-imitation-learning/:file" },
  { source: "/images/engineering/:path*", destination: "/engineering/images/:path*" },
  ...Object.entries(PORTFOLIO).map(([n, to]) => ({ source: `/images/portfolio/${n}/:file`, destination: `/${to}/:file` })),
  { source: "/models/web/:file", destination: "/3d/models/:file" },
  // Photos only (two segments ending in an image type); /photography/<slug> is a page.
  { source: "/photography/:collection/:file([^/]+\\.(?:jpe?g|png|webp|avif))", destination: "/photography/images/:collection/:file" },
].map((r) => ({ ...r, permanent: true }));

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
  },

  // Old URLs that may be bookmarked, indexed or on old résumés.
  async redirects() {
    return [
      { source: "/portfolio", destination: "/design", permanent: true },
      { source: "/thank-you", destination: "/", permanent: true },
      // Each section now has its own about page; the lobby covers the whole person.
      { source: "/about", destination: "/", permanent: false },
      // Files moved into public/<section>/<type>/ (September 2026).
      ...MOVED,
    ];
  },

  async headers() {
    // Engineering is kept out of search (content/site.ts `searchable: false`).
    // Pages get a noindex meta tag from their layout; files can't carry one,
    // so its PDFs and images get the equivalent header.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      // Engineering's pages, images, videos and PDFs all live under /engineering.
      { source: "/engineering/:path*", headers: noindex },
      {
        source: "/3d/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
