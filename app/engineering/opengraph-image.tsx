import { ogCard, OG_SIZE, grid } from "@/app/_lib/og";

export const alt = "Aidan Schreder, engineering portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "Engineering portfolio",
    lines: ["Aidan", "Schreder"],
    footer: "Systems Design Engineering · University of Waterloo · Robotics, CAD, research",
    bg: "#05080d",
    fg: "#e8edf3",
    muted: "#8a95a5",
    ...grid("rgba(130,170,255,0.12)", 64),
  });
}
