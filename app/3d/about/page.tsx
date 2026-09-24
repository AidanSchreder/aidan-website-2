import type { Metadata } from "next";
import { ContactLine } from "../../_components/ContactLine";
import { FooterLine } from "../../_components/FooterLine";
import styles from "../three-d.module.css";

const description = "About Aidan Schreder's 3D work: Blender since 2021, environments, hard-surface models and animation.";

export const metadata: Metadata = {
  title: "About · 3D",
  description,
  alternates: { canonical: "/3d/about" },
  openGraph: {
    title: "About · Aidan Schreder, 3D",
    description,
    url: "/3d/about",
    images: [{ url: "/3d/opengraph-image", width: 1200, height: 630 }],
  },
};

const FACTS = [
  { label: "Tools", value: "Blender, Premiere Pro, eSpeak NG" },
  { label: "Challenges", value: "CGBoost “Life on a Train” render challenge, 2021" },
  { label: "Assets", value: "Low-poly forest pack, available on CGTrader" },
  { label: "3D printing", value: "7+ original print designs" },
];

export default function ThreeDAbout() {
  return (
    <main id="main">
      <section className={styles.aboutPage} aria-labelledby="about-heading">
        <div className={styles.heroGrid} aria-hidden="true" />
        <p className={`${styles.eyebrow} ${styles.fadeUp}`}>✦ 3D — About</p>
        <h1 id="about-heading" className={`${styles.aboutName} ${styles.fadeUp} ${styles.d2}`}>
          Aidan
          <br />
          <span className={styles.outline}>Schreder</span>
        </h1>

        <div className={`${styles.aboutBody} ${styles.fadeUp} ${styles.d3}`}>
          <p className={styles.aboutText}>
            I&apos;ve been modelling in Blender since 2021: environments, hard-surface machines, concept design and an
            animated short film.
          </p>
          <dl className={styles.aboutFacts}>
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.aboutEnd} id="contact">
        <ContactLine section="3d" form />
        <FooterLine about="/3d/about" />
      </section>
    </main>
  );
}
