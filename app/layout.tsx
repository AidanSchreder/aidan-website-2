import type { Metadata } from "next";
import "./globals.css";
import { prodes, spaceMono } from "./_fonts/brand";
import { ThemeProvider } from "./_components/theme/ThemeProvider";
import { THEME_SCRIPT } from "./_components/theme/script";
import { PageviewTracker } from "./_components/analytics/PageviewTracker";
import { GoogleAnalytics } from "./_components/analytics/GoogleAnalytics";
import { MicrosoftClarity } from "./_components/analytics/MicrosoftClarity";
import { StructuredData } from "./_components/StructuredData";
import { NAME, SITE_URL } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: NAME, template: `%s · ${NAME}` },
  description: "Aidan Schreder.",
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { type: "website", locale: "en_CA", siteName: NAME },
  twitter: { card: "summary_large_image" },
  verification: { google: "KV5X69EIfvQHIWt6E58u2nkAdodVgCxoO3iSBIR0isk" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${prodes.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Resolves light/dark before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        <PageviewTracker />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <StructuredData />
      </body>
    </html>
  );
}
