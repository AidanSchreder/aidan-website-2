import type { Metadata } from "next";
import Image from "next/image";
import { ContactLine } from "../../_components/ContactLine";
import { getLibrary } from "../../_lib/photos";
import styles from "../photography.module.css";

const description = "About Aidan Schreder's photography: night streets, architecture and interiors.";

export async function generateMetadata(): Promise<Metadata> {
  const { collections } = await getLibrary();
  const cover = collections.find((c) => c.slug === "family-field")?.photos[0];
  return {
    title: "About · Photography",
    description,
    alternates: { canonical: "/photography/about" },
    openGraph: {
      title: "About · Aidan Schreder, Photography",
      description,
      url: "/photography/about",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : undefined,
    },
  };
}

export default async function PhotographyAbout() {
  const { collections } = await getLibrary();
  const field = collections.find((c) => c.slug === "family-field")?.photos[0];

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

        {field && (
          <figure className={styles.aboutFigure}>
            <Image
              src={field.src}
              alt="Family Field: two dandelions in a field"
              width={field.width}
              height={field.height}
              sizes="(max-width: 900px) 100vw, 34vw"
              placeholder="blur"
              blurDataURL={field.blur}
              quality={85}
              preload
            />
            <figcaption>Family Field</figcaption>
          </figure>
        )}
      </article>
    </div>
  );
}
