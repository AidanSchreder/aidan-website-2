import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GridTransitionProvider } from "./components/GridTransitionProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import StructuredData from "./components/StructuredData";
import GoogleAnalytics from "./components/GoogleAnalytics";
import MicrosoftClarity from "./components/MicrosoftClarity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ── metadataBase ────────────────────────────────────────────────────────────
  // Required: Next.js uses this to resolve all relative URLs in metadata.
  // Replace with your actual domain.
  metadataBase: new URL("https://aidanschreder.com"),
 
  // ── Basic ────────────────────────────────────────────────────────────────────
  title: {
    // `default` is used on any page that doesn't call generateMetadata()
    default: "Aidan Schreder — Brand & Identity Designer",
    // `template` wraps per-page titles: "Logo Design · Aidan Schreder"
    template: "%s · Aidan Schreder",
  },
  description:
    "Aidan Schreder is a brand identity designer and systems engineer crafting bold logos, visual identities, and impressive technical projects. Available for freelance.",
  keywords: [
    "brand identity designer",
    "logo design",
    "visual identity",
    "freelance designer",
    "graphic design",
    "print design",
    "spatial design",
    "systems engineer",
    "Aidan Schreder",
  ],
  authors: [{ name: "Aidan Schreder", url: "https://aidanschreder.com" }],
  creator: "Aidan Schreder",
 
  // ── Canonical & robots ───────────────────────────────────────────────────────
  // Next.js auto-generates a canonical tag from metadataBase + page path.
  // You can override per-page with generateMetadata() if needed.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
 
  // ── Open Graph ───────────────────────────────────────────────────────────────
  // Controls the card shown when your link is shared on Slack, iMessage, etc.
  // Place your OG image at /public/og-image.jpg (1200×630px recommended).
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://aidanschreder.com",
    siteName: "Aidan Schreder",
    title: "Aidan Schreder — Brand & Identity Designer",
    description:
      "Brand identity designer and systems engineer crafting bold logos, visual identities, and impressive technical projects. Available for freelance.",
    images: [
      {
        url: "/og-image.jpg",   // → resolves to https://aidanschreder.com/og-image.jpg
        width: 1200,
        height: 630,
        alt: "Aidan Schreder — Brand & Identity Designer",
      },
    ],
  },
 
  // ── Twitter / X Card ─────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Aidan Schreder — Brand & Identity Designer",
    description:
      "Brand identity designer and systems engineer. Bold logos, visual identities, and impressive technical projects.",
    images: ["/og-image.jpg"],
    // If you have a Twitter/X handle, add it:
    // creator: "@yourhandle",
  },
 
  // ── Verification ─────────────────────────────────────────────────────────────
  // After submitting your sitemap to Google Search Console, paste the
  // verification token here (find it under Settings → Ownership verification).
  verification: {
    google: "PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN_HERE",
    // bing: "PASTE_IF_NEEDED",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
    <GoogleAnalytics />     {/* loads after consent granted */}
    <MicrosoftClarity />    {/* always loads, no consent needed */}
    <StructuredData />
        <ThemeProvider>
            <GridTransitionProvider>

        

        {children}

        
        
            </GridTransitionProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}
