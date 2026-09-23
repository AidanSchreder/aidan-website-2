import { ogCard, OG_SIZE } from "@/app/_lib/og";

export const alt = "Aidan Schreder, brand identity and logo design";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "Design portfolio",
    lines: ["Aidan", "Schreder"],
    footer: "Brand identity & logo design",
    bg: "#fff",
    fg: "#000",
    muted: "#646464",
  });
}
