import type { Metadata } from "next";
import styles from "../design.module.css";

const description = "About Aidan Schreder's brand identity and logo design work.";

export const metadata: Metadata = {
  title: "About · Design",
  description,
  alternates: { canonical: "/design/about" },
  openGraph: {
    title: "About · Aidan Schreder, Design",
    description,
    url: "/design/about",
    images: [{ url: "/design/opengraph-image", width: 1200, height: 630 }],
  },
};

const CLIENTS = [
  { name: "Spright Games", note: "Minecraft DLC studio" },
  { name: "STEM 4 ALL", note: "FRC Team 8224" },
  { name: "Iron Bears", note: "FRC Team 854" },
  { name: "TEDx Youth", note: "Design competition winner, two years running" },
  { name: "Relay For Life", note: "Local branch" },
  { name: "SEDS Canada", note: "CAN-RGX" },
];

export default function DesignAbout() {
  return (
    <main id="main" className={styles.aboutPage}>
      <p className="label">About</p>
      <h1 className={styles.aboutName}>
        <span>Aidan</span> <span className={styles.hollow}>Schreder</span>
      </h1>

      <p className={styles.aboutLead}>
        From leading robotics teams to designing identities for game studios, I focus on turning rough ideas into clear,
        functional results.
      </p>

      <div className={styles.aboutGrid}>
        <dl className={styles.aboutStats}>
          <div>
            <dt>Logos delivered</dt>
            <dd>10+</dd>
          </div>
          <div>
            <dt>Years of design experience</dt>
            <dd>6+</dd>
          </div>
        </dl>

        <section aria-labelledby="clients">
          <h2 id="clients" className="label">
            Clients &amp; collaborators
          </h2>
          <ul className={styles.clients}>
            {CLIENTS.map((c) => (
              <li key={c.name}>
                <span>{c.name}</span>
                <em>{c.note}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
