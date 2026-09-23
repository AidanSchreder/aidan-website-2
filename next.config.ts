import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
  },

  // v1 URLs that may be bookmarked or on old résumés.
  // /tron-portfolio.pdf and /ICRA-paper.pdf are still served as files.
  async redirects() {
    return [
      { source: "/portfolio", destination: "/design", permanent: true },
      { source: "/thank-you", destination: "/", permanent: true },
      // Each section now has its own about page; the lobby covers the whole person.
      { source: "/about", destination: "/", permanent: false },
    ];
  },

  async headers() {
    // Engineering is kept out of search (content/site.ts `searchable: false`).
    // Pages get a noindex meta tag from their layout; files can't carry one,
    // so its PDFs and images get the equivalent header.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/tron-portfolio.pdf", headers: noindex },
      { source: "/ICRA-paper.pdf", headers: noindex },
      { source: "/resume.pdf", headers: noindex },
      { source: "/images/engineering/:path*", headers: noindex },
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
