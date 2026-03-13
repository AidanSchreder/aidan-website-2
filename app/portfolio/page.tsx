// ── app/portfolio/page.tsx (SERVER COMPONENT WRAPPER) ────────────────────────
//
// HOW TO USE:
//   1. Rename your current app/portfolio/page.tsx → app/portfolio/PortfolioClient.tsx
//   2. Replace app/portfolio/page.tsx with THIS file.
//
// Why: Next.js requires `metadata` exports to be in a Server Component.
// Your existing page uses "use client", so we split them:
//   • This file  → Server Component, owns the metadata export
//   • PortfolioClient.tsx → Client Component, owns all your existing UI/logic
//
// No changes needed to PortfolioClient.tsx other than the filename.

import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";

export const metadata: Metadata = {
  title: "Design Portfolio",
  description:
    "A curated archive of Aidan Schreder's design work — branding, spatial, digital, and print disciplines. Bold identities built with precision.",
  openGraph: {
    title: "Design Portfolio · Aidan Schreder",
    description:
      "A curated archive of design work across branding, spatial, digital, and print disciplines.",
    url: "https://aidanschreder.com/portfolio",
    images: [
      {
        url: "/og-image-portfolio.jpg",
        width: 1200,
        height: 630,
        alt: "Aidan Schreder Design Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Portfolio · Aidan Schreder",
    description:
      "Brand identity, spatial, digital, and print design. A curated archive of selected works.",
    images: ["/og-image-portfolio.jpg"],
  },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
