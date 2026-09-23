import { instrumentSans } from "../_fonts/instrument-sans";
import { getLibrary } from "../_lib/photos";
import { PhotoShell } from "./PhotoShell";
import styles from "./photography.module.css";

export default async function PhotographyLayout({ children }: { children: React.ReactNode }) {
  const { collections } = await getLibrary();
  const nav = collections.map((c) => ({ slug: c.slug, title: c.title, count: c.photos.length }));

  return (
    <div data-section="photography" className={`${styles.root} ${instrumentSans.variable}`}>
      <PhotoShell collections={nav}>{children}</PhotoShell>
    </div>
  );
}
