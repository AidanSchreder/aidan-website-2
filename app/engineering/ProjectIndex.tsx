"use client";

// Project list. Deliberately few text styles: a title, body text, and one
// quiet secondary style for everything else (dates, status, context, tools,
// skills, authors). Filters live in two multi-select dropdowns so they weigh
// almost nothing until someone wants them: any selected type AND any selected
// tool. A project with more photos shows a small stack of sheets behind its
// cover, which fans out on hover.

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DOMAINS, toolbox, type Project } from "@/content/engineering";
import { Lightbox } from "../_components/Lightbox";
import { MultiSelect } from "../_components/MultiSelect";
import { trackOpen, type TrackItem } from "../_lib/track";
import { useDwell } from "../_lib/useDwell";
import styles from "./engineering.module.css";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [types, setTypes] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [viewer, setViewer] = useState<{ project: Project; index: number } | null>(null);
  const reduce = useReducedMotion();

  const typeOptions = useMemo(() => DOMAINS.filter((d) => projects.some((p) => p.domains.includes(d))), [projects]);
  const toolOptions = useMemo(() => toolbox(projects).map((t) => t.tool), [projects]);
  const shown = projects.filter(
    (p) =>
      (types.length === 0 || p.domains.some((d) => types.includes(d))) &&
      (tools.length === 0 || p.tools.some((t) => tools.includes(t))),
  );

  const open = (project: Project, index: number) => {
    setViewer({ project, index });
    trackOpen(itemFor(project));
  };

  return (
    <section id="projects" className={styles.index} aria-label="Projects">
      <div className={styles.filters}>
        <MultiSelect label="Type of work" placeholder="All work" options={typeOptions} value={types} onChange={setTypes} />
        <MultiSelect label="Tools" placeholder="Any tool" options={toolOptions} value={tools} onChange={setTools} />
        <span className="sr-only" aria-live="polite">
          {shown.length} of {projects.length} projects shown
        </span>
      </div>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p) => (
            <motion.div
              key={p.id}
              layout={!reduce}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectEntry project={p} onOpen={(i) => open(p, i)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {shown.length === 0 && <p className={`${styles.secondary} ${styles.empty}`}>No projects match these filters.</p>}
      </div>

      <AnimatePresence>
        {viewer && (
          <Lightbox
            key="viewer"
            title={viewer.project.title}
            items={viewer.project.figures}
            index={viewer.index}
            onIndex={(index) => setViewer((v) => (v ? { ...v, index } : v))}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function itemFor(p: Project): TrackItem {
  return { section: "engineering", id: p.id, title: p.title, thumb: p.figures[0]?.src, href: `/engineering#${p.id}` };
}

/** Date, status and context in one quiet line. */
function metaLine(p: Project) {
  return [p.publication && `Publication, ${p.publication.venue}`, p.status, p.date, p.context].filter(Boolean).join(" · ");
}

const sheetSpring = { type: "spring", stiffness: 260, damping: 22 } as const;
const SIZES = "(max-width: 860px) 100vw, 40vw";

/**
 * The cover photo with the project's next photos stacked behind it (max two),
 * each cropped to the same 4:3 frame and outlined. The stack fans out on hover.
 */
function Figure({ project: p, onOpen }: { project: Project; onOpen: (index: number) => void }) {
  const reduce = useReducedMotion();
  const [cover, ...rest] = p.figures;
  // Deepest sheet first so it paints underneath.
  const behind = rest.slice(0, 2).reverse();

  return (
    <motion.div className={styles.figureWrap} initial="rest" animate="rest" whileHover={reduce ? undefined : "fan"}>
      {behind.map((f, k) => {
        const depth = behind.length - k;
        return (
          <motion.span
            key={f.src}
            className={styles.sheet}
            aria-hidden="true"
            variants={{
              rest: { x: depth * 7, y: -depth * 7, rotate: 0 },
              fan: { x: depth * 11, y: -depth * 10, rotate: depth * 1.6 },
            }}
            transition={sheetSpring}
          >
            <Image src={f.src} alt="" fill sizes={SIZES} style={{ objectPosition: f.focus }} />
          </motion.span>
        );
      })}
      <button
        className={styles.figure}
        onClick={() => onOpen(0)}
        aria-label={p.figures.length > 1 ? `View ${p.figures.length} images: ${p.title}` : `View image: ${p.title}`}
      >
        <Image src={cover.src} alt={cover.caption} fill sizes={SIZES} style={{ objectPosition: cover.focus }} />
      </button>
    </motion.div>
  );
}

function ProjectEntry({ project: p, onOpen }: { project: Project; onOpen: (index: number) => void }) {
  const ref = useDwell<HTMLElement>(itemFor(p));
  const pub = p.publication;

  return (
    <article ref={ref} id={p.id} className={styles.project} aria-labelledby={`${p.id}-title`}>
      <Figure project={p} onOpen={onOpen} />

      <div className={styles.body}>
        <h2 id={`${p.id}-title`} className={styles.title}>
          {p.title}
        </h2>
        <p className={styles.secondary}>{metaLine(p)}</p>

        <div className={styles.text}>
          <p>{p.summary}</p>
          <ul>
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>

        <div className={styles.details}>
          {pub && (
            <p>
              Authors:{" "}
              {pub.authors.map((a, i) => (
                <span key={a.name}>
                  {a.me ? <strong>{a.name}</strong> : a.name}
                  {a.equal && "*"}
                  {i < pub.authors.length - 1 && ", "}
                </span>
              ))}{" "}
              (*equal contribution)
            </p>
          )}
          {pub && <p>System: {pub.system.join(", ")}</p>}
          {p.tools.length > 0 && <p>Tools: {p.tools.join(", ")}</p>}
          {p.skills.length > 0 && <p>Skills: {p.skills.join(", ")}</p>}
        </div>

        {p.links && (
          <p className={styles.links}>
            {p.links.map((l) => (
              <a key={l.href} href={l.href} {...external}>
                {l.label}
              </a>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}
