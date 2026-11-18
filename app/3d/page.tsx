import type { Metadata } from "next";
import { THREE_D } from "@/content/three-d";
import { share } from "../_lib/share";
import { ThreeDView } from "./ThreeDView";

const description =
  "3D work by Aidan Schreder: Blender environments, hard-surface models, concept design and an animated short film.";

export const metadata: Metadata = {
  title: "3D",
  description,
  alternates: { canonical: "/3d" },
  ...share({ title: "Aidan Schreder · 3D", description, url: "/3d" }),
};

export default function ThreeDPage() {
  return <ThreeDView pieces={THREE_D} />;
}
