import { ogCard, OG_SIZE } from "@/app/_lib/og";

export const alt = "Aidan Schreder, 3D work";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "Aidan Schreder · 3D",
    lines: ["Models &", "Renders"],
    footer: "Blender environments, hard-surface models and animation",
    bg: "#000",
    fg: "#fff",
    muted: "#b5b5b5",
    image: "/3d/images/machine-replication-horizon/0.jpg",
    imageWash: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)",
  });
}
