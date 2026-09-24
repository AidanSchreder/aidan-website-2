import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sizeOf, withSizes } from "../../_lib/image-size";
import { DESIGN } from "@/content/design";
import { ProjectView } from "./ProjectView";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGN.map((p) => ({ slug: p.id }));
}

/** ["Logo", "Brandmark", "Apparel"] → "logo, brandmark and apparel" */
const list = (items: string[]) =>
  (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]).toLowerCase();

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const piece = DESIGN.find((p) => p.id === slug);
  if (!piece) return {};
  const cover = piece.slides[0];
  const description = `${piece.title}: ${list(piece.deliverables)} by Aidan Schreder.`;
  return {
    title: `${piece.title} · Design`,
    description,
    alternates: { canonical: `/design/${piece.id}` },
    openGraph: {
      title: `${piece.title} · Aidan Schreder`,
      description,
      url: `/design/${piece.id}`,
      images: [{ url: cover.src, alt: cover.caption, ...(await sizeOf(cover.src)) }],
    },
    twitter: { title: `${piece.title} · Aidan Schreder`, description, images: [cover.src] },
  };
}

export default async function DesignProjectPage({ params }: Params) {
  const { slug } = await params;
  const i = DESIGN.findIndex((p) => p.id === slug);
  if (i < 0) notFound();

  const piece = { ...DESIGN[i], slides: await withSizes(DESIGN[i].slides) };
  const n = DESIGN.length;
  const link = (p: (typeof DESIGN)[number]) => ({ id: p.id, title: p.title });

  return (
    <main id="main">
      <ProjectView piece={piece} prev={link(DESIGN[(i - 1 + n) % n])} next={link(DESIGN[(i + 1) % n])} />
    </main>
  );
}
