import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── IMAGE OPTIMISATION ────────────────────────────────────────────────────
  // next/image is used in FloatImg.tsx (parallax images) and
  // PortfolioClient.tsx (slideshow cards). All images are local files served
  // from /public, so no remotePatterns are needed.
  //
  // Next.js serves optimised WebP/AVIF variants automatically at build time.
  // The `formats` array controls which modern formats are offered — AVIF gives
  // better compression than WebP but takes longer to encode; both are listed
  // so Next.js can serve whichever the browser prefers.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;