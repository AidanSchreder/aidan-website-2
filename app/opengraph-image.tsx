import { ogCard, OG_SIZE, grid } from "@/app/_lib/og";

export const alt = "Aidan Schreder";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "",
    lines: ["Aidan", "Schreder"],
    footer: "aidanschreder.com",
    bg: "#000",
    fg: "#fff",
    muted: "#8c8c8c",
    ...grid("rgba(255,255,255,0.07)", 80),
  });
}
