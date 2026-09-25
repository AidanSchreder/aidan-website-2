import type { Metadata } from "next";
import { engineeringLinks } from "../_lib/resume";
import { share } from "../_lib/share";
import { PROJECTS } from "@/content/engineering";
import { ProjectIndex } from "./ProjectIndex";
import styles from "./engineering.module.css";

const description =
  "Engineering portfolio of Aidan Schreder, Systems Design Engineering at the University of Waterloo: robotics, mechanical design, imitation-learning research and software.";

export const metadata: Metadata = {
  title: "Engineering",
  description,
  alternates: { canonical: "/engineering" },
  ...share({ title: "Aidan Schreder · Engineering", description, url: "/engineering" }),
};

export default function EngineeringPage() {
  return (
    <main id="main">
      <header className={styles.hero}>
        <h1 className={styles.name}>Aidan Schreder</h1>
        <p className={styles.heroText}>
          Systems Design Engineering, University of Waterloo. Robotics, mechanical design, machine-learning research and
          software.
        </p>
        <p className={styles.heroLinks}>
          {engineeringLinks().map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </p>
      </header>

      <ProjectIndex projects={PROJECTS} />
    </main>
  );
}
