import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { altFor, getLibrary, photoId } from "../../_lib/photos";
import { share } from "../../_lib/share";
import { CollectionView } from "./CollectionView";
import styles from "../photography.module.css";

type Params = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const { collections } = await getLibrary();
  return collections.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  const { collections } = await getLibrary();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await find((await params).slug);
  if (!c) return {};
  const cover = c.photos.find((p) => p.home) ?? c.photos[0];
  const description = c.description ?? `${c.title}: photographs by Aidan Schreder.`;
  return {
    title: `${c.title} · Photography`,
    description,
    alternates: { canonical: `/photography/${c.slug}` },
    ...share({
      title: `${c.title} · Aidan Schreder`,
      description,
      url: `/photography/${c.slug}`,
      images: [{ url: cover.src, width: cover.width, height: cover.height }],
    }),
  };
}

export default async function CollectionPage({ params }: Params) {
  const c = await find((await params).slug);
  if (!c) notFound();

  const tiles = c.photos.map((p, i) => ({
    id: photoId(c, p),
    slug: c.slug,
    file: p.file,
    title: c.title,
    src: p.src,
    width: p.width,
    height: p.height,
    blur: p.blur,
    alt: altFor(c, p, i),
    caption: p.caption,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.collectionHead}>
        <h1>{c.title}</h1>
        <p className={styles.collectionMeta}>
          {[c.location, c.year, `${c.photos.length} ${c.photos.length === 1 ? "photograph" : "photographs"}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {c.description && <p className={styles.collectionText}>{c.description}</p>}
      </header>
      <CollectionView title={c.title} tiles={tiles} />
    </div>
  );
}
