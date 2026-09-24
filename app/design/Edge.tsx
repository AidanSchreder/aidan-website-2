// The edge every design image gets, so artwork whose background matches the
// page still reads as a shape: a faint glow of grain in the image's own
// colours behind it (Glow), and a thin light edge on its top-left rim
// (LightEdge). The edge is drawn over the image, so it disappears into white
// artwork instead of outlining it grey, and the image shows through it.
//
// Both go inside a positioned box the size of the image: Glow before the
// image, LightEdge after. Styles: "IMAGE EDGE" in design.module.css.

import Image from "next/image";
import styles from "./design.module.css";

/** Ambient grain glow, off for now: set to true to bring it back on every design image. */
const GLOW = false;

export function Glow({ src }: { src: string }) {
  if (!GLOW) return null;
  return (
    <span className={styles.glow} aria-hidden="true">
      <span className={styles.glowImg}>
        <Image src={src} alt="" fill sizes="240px" quality={70} />
      </span>
    </span>
  );
}

export function LightEdge() {
  return <span className={styles.lightEdge} aria-hidden="true" />;
}
