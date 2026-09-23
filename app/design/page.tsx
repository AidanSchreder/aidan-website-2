import type { Metadata } from "next";
import { withSizes } from "../_lib/image-size";
import { DESIGN } from "@/content/design";
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
  const pieces = await Promise.all(DESIGN.map(async (p) => ({ ...p, slides: await withSizes(p.slides) })));

  return (
    <main id="main">
      <DesignHero />
      <DesignWork pieces={pieces} />
    </main>
  );
}
