import { NAME, SITE_URL } from "@/content/site";

// Deliberately minimal JSON-LD: just the name and site. Listing disciplines,
// school or linked profiles here would hand search engines the whole profile
// in one place, which the site is structured to avoid.
export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": `${SITE_URL}/#person`, name: NAME, url: SITE_URL },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: NAME, author: { "@id": `${SITE_URL}/#person` } },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
