import type { Metadata } from "next";
import Image from "next/image";
import { ContactLine } from "../../_components/ContactLine";
import { altFor, getLibrary, type Collection, type Photo } from "../../_lib/photos";
import { share } from "../../_lib/share";
import styles from "../photography.module.css";

const description = "About Aidan Schreder's photography: night streets, architecture and interiors.";

/** The photo beside the text (collection folder, file). Also this page's link preview. */
const PHOTO = { collection: "quebec-night", file: "01_home.jpg" };

/** PHOTO, or the first collage photo if it has been moved or renamed. */
async function aboutPhoto() {
  const { collections } = await getLibrary();
  const first = (match: (c: Collection, p: Photo) => boolean) => {
    for (const c of collections) {
      const i = c.photos.findIndex((p) => match(c, p));
      if (i >= 0) return { ...c.photos[i], title: c.title, alt: altFor(c, c.photos[i], i) };
    }
    return null;
  };
  return first((c, p) => c.slug === PHOTO.collection && p.file === PHOTO.file) ?? first((_, p) => p.home);
}

export async function generateMetadata(): Promise<Metadata> {
  const cover = await aboutPhoto();
  return {
    title: "About · Photography",
    description,
    alternates: { canonical: "/photography/about" },
    ...share({
      title: "About · Aidan Schreder, Photography",
      description,
      url: "/photography/about",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : undefined,
    }),
  };
}

export default async function PhotographyAbout() {
  const photo = await aboutPhoto();

  return (
    <div className={styles.page}>
      <article className={styles.about}>
        <div className={styles.aboutText}>
          <h1>About</h1>
          <p>
            I&apos;m drawn to nighttime street photography because of the way artificial light transforms ordinary spaces,
            creating contrast between illuminated areas and the small pockets of darkness that appear in streets, doorways
            and alleyways. Working in those conditions forces a slower, more deliberate approach to composition.
          </p>
          <p>
            In daylight I look for architecture: the stonework, arches, glass and craftsmanship that go unnoticed when
            you move quickly through a city.
          </p>

          <dl className={styles.aboutFacts}>
            <div>
              <dt>Work</dt>
              <dd>2,000+ professional photos</dd>
            </div>
          </dl>

          <ContactLine section="photography" className={styles.aboutContact} />
        </div>

        {photo && (
          <figure className={styles.aboutFigure}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 900px) 100vw, 34vw"
              placeholder="blur"
              blurDataURL={photo.blur}
              quality={85}
              preload
            />
            <figcaption>{photo.title}</figcaption>
          </figure>
        )}
      </article>
    </div>
  );
}
