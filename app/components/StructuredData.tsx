// ── STRUCTURED DATA (JSON-LD) ─────────────────────────────────────────────────
// Place this file at: app/components/StructuredData.tsx
//
// Then import and render it inside your root app/layout.tsx, inside <body>:
//   import StructuredData from "./components/StructuredData";
//   ...
//   <body>
//     <StructuredData />
//     {children}
//   </body>
//
// This tells Google who you are (Person schema) and what you offer (Service),
// which can enable rich results and improves how your site appears in search.
// Test it after deployment at: https://search.google.com/test/rich-results

export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // ── Person ─────────────────────────────────────────────────────────────
      // Identifies you as the creator of this site and establishes your
      // professional identity for Google's Knowledge Graph.
      {
        "@type": "Person",
        "@id": "https://aidanschreder.com/#person",
        name: "Aidan Schreder",
        url: "https://aidanschreder.com",
        email: "hello@aidanschreder.com",
        jobTitle: "Brand & Identity Designer",
        description:
          "Brand identity designer and systems engineer crafting bold logos, visual identities, and impressive technical projects. Available for freelance.",
        knowsAbout: [
          "Brand Identity Design",
          "Logo Design",
          "Visual Identity Systems",
          "Print Design",
          "Spatial Design",
          "Digital Design",
          "Photography",
          "Systems Engineering",
          "3D Design",
        ],
        // If you have social profiles, add them here:
        // sameAs: [
        //   "https://www.linkedin.com/in/aidanschreder",
        //   "https://www.instagram.com/aidanschreder",
        //   "https://dribbble.com/aidanschreder",
        // ],
      },

      // ── WebSite ────────────────────────────────────────────────────────────
      // Helps Google understand your site structure.
      {
        "@type": "WebSite",
        "@id": "https://aidanschreder.com/#website",
        url: "https://aidanschreder.com",
        name: "Aidan Schreder",
        description: "Portfolio of Aidan Schreder — Brand & Identity Designer",
        author: { "@id": "https://aidanschreder.com/#person" },
      },

      // ── Service ────────────────────────────────────────────────────────────
      // Describes what you offer to potential freelance clients.
      {
        "@type": "Service",
        "@id": "https://aidanschreder.com/#service",
        name: "Brand Identity & Logo Design",
        provider: { "@id": "https://aidanschreder.com/#person" },
        description:
          "Freelance brand identity design services including logo design, visual identity systems, print, spatial, and digital design.",
        serviceType: "Brand Identity Design",
        areaServed: "Worldwide",
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: "https://aidanschreder.com/#contact",
          availableLanguage: "English",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
