import type { Metadata } from "next";
import { engineeringLinks } from "../../_lib/resume";
import { LINKS } from "@/content/site";
import styles from "../engineering.module.css";

const description = "About Aidan Schreder: Systems Design Engineering at the University of Waterloo, research with the National Research Council Canada, FRC team captain.";

export const metadata: Metadata = {
  title: "About · Engineering",
  description,
  alternates: { canonical: "/engineering/about" },
  openGraph: {
    title: "About · Aidan Schreder, Engineering",
    description,
    url: "/engineering/about",
    images: [{ url: "/engineering/opengraph-image", width: 1200, height: 630 }],
  },
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function EngineeringAbout() {
  return (
    <main id="main" className={styles.about}>
      <div className={styles.aboutText}>
        <h1 className={styles.aboutTitle}>About</h1>
        <p>
          Hello! My name is Aidan, and I love to build to impress. My projects span design, mechanical, software,
          photography and more, but they all start the same way: curiosity, passion, and an obsession with detail. From
          leading robotics teams to designing identities for game studios, I focus on turning rough ideas into clear,
          functional results.
        </p>
        <p>
          I&apos;m drawn to work that lives at the intersection of technical rigor and creative thinking. Whether it&apos;s
          a mechanical system, a piece of software, or a visual identity, the goal is always the same: build something
          thoughtful, useful, and enduring.
        </p>
      </div>

      <div className={styles.aboutFacts}>
        <p>Education: Systems Design Engineering, University of Waterloo</p>
        <p>
          Research: National Research Council Canada. Equal-contribution co-author of{" "}
          <a href={LINKS.icraPaper} {...external}>
            On the Role of Haptic Feedback in Demonstration Collection for Visuomotor Policy Learning
          </a>
        </p>
        <p>Leadership: Captain, FIRST Robotics Competition Team 854, 2025 season</p>
        <p className={styles.heroLinks}>
          {engineeringLinks().map((l) => (
            <a key={l.label} href={l.href} {...external}>
              {l.label}
            </a>
          ))}
        </p>
      </div>
    </main>
  );
}
