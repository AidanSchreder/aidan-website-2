import type { Metadata } from "next";
import { DESIGN, homeSlides } from "@/content/design";
import { sizeOf } from "../_lib/image-size";
import { DesignHero } from "./DesignHero";
import { DesignWork } from "./DesignWork";

const description =
  "Brand identity and logo design by Aidan Schreder: marks, apparel and style guides for robotics teams, a game studio and community events.";

export const metadata: Metadata = {
  title: "Design",
  description,
  alternates: { canonical: "/design" },
  openGraph: { title: "Aidan Schreder · Design", description, url: "/design" },
  twitter: { title: "Aidan Schreder · Design", description },
};

export default async function DesignPage() {
  // Each tile takes its proportions from its first homepage slide.
  const pieces = await Promise.all(
    DESIGN.map(async (p) => {
      const slides = homeSlides(p);
      const { width, height } = await sizeOf(slides[0].src);
      return { id: p.id, title: p.title, slides, ratio: width / height };
    }),
  );

  return (
    <main id="main">
      <DesignHero />
      <DesignWork pieces={pieces} />
    </main>
  );
}
