"use client";

// The v1 landing page, now the 3D site: grid-overlay hero with ghost type,
// floating renders and drag-to-spin models on scroll parallax, then the
// work grid with the FLIP lightbox from the old portfolio page.

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ThreeDPiece } from "@/content/three-d";
import { ContactLine } from "../_components/ContactLine";
import { FooterLine } from "../_components/FooterLine";
import { Work } from "./Work";
import styles from "./three-d.module.css";

// three.js stays out of the initial bundle; models are decorative.
const FloatModel = dynamic(() => import("./_components/FloatModel"), { ssr: false });
const FloatImg = dynamic(() => import("./_components/FloatImg"), { ssr: false });

// pc: images + models · tablet: images only · phone / portrait windows: neither.
type Device = "pc" | "tablet" | "phone" | null;
function subscribeDevice(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function readDevice(): Device {
  if (window.matchMedia("(pointer: coarse) and (max-width: 767px)").matches) return "phone";
  if (window.matchMedia("(pointer: coarse)").matches) return "tablet";
  if (window.matchMedia("(max-aspect-ratio: 1/1)").matches) return "phone";
  return "pc";
}

/** Scroll position relative to an element's top, as a motion value. */
function useRelativeScroll(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollY } = useScroll();
  const top = useRef(0);
  useEffect(() => {
    const measure = () => {
      if (ref.current) top.current = ref.current.getBoundingClientRect().top + window.scrollY;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [ref]);
  return useTransform(scrollY, (v) => v - top.current);
}

const by = (k: number) => (v: number) => v * k;

export function ThreeDView({ pieces }: { pieces: ThreeDPiece[] }) {
  const device = useSyncExternalStore(subscribeDevice, readDevice, () => null);
  const showImgs = device === "pc" || device === "tablet";
  const showModels = device === "pc";

  const heroRef = useRef<HTMLElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const hero = useRelativeScroll(heroRef);
  const mid = useRelativeScroll(midRef);
  const work = useRelativeScroll(workRef);
  const end = useRelativeScroll(endRef);

  const gridY = useTransform(hero, by(0.03));
  const ghostY = useTransform(hero, (v) => `calc(-50% + ${v * 0.3}px)`);
  const lineY = useTransform(hero, by(0.12));
  const nameY = useTransform(hero, by(-0.16));
  const tagY = useTransform(hero, by(-0.04));
  const cornerY = useTransform(hero, (v) => `calc(-50% + ${v * 0.08}px)`);
  const workGhostY = useTransform(work, by(0.2));
  const workTitleY = useTransform(work, by(0.08));
  const endGhostY = useTransform(end, by(0.25));

  return (
    <>
      <main id="main">
        {/* ── HERO ── */}
        <section className={styles.hero} ref={heroRef} aria-labelledby="hero-heading">
          <motion.div className={styles.heroGrid} style={{ y: gridY }} aria-hidden="true" />
          <motion.div className={styles.heroGhost} style={{ x: "-50%", y: ghostY }} aria-hidden="true">
            3D
          </motion.div>
          <motion.div className={styles.decoLine} style={{ y: lineY }} aria-hidden="true" />

          {showModels && (
            <FloatModel label="Research and Sample Pod #13" width={400} height={400} top="8%" left="55%" speed={0.25} scroll={hero} zIndex={2} modelScale={3.3} modelSrc="/models/web/RSPod13.glb" />
          )}
          {showImgs && <FloatImg label="IMG 02" width={230} height={230} top="45%" left="39%" speed={0.2} scroll={hero} src="/images/portfolio/10/1.jpg" />}
          {showImgs && <FloatImg label="IMG 03" width={330} height={400} top="18%" left="70%" speed={0.3} scroll={hero} src="/images/portfolio/07/0.jpg" />}

          <motion.div className={styles.cornerTag} style={{ y: cornerY }} aria-hidden="true">
            3D work — 2021–2026
          </motion.div>

          <div className={styles.heroContent}>
            <p className={`${styles.eyebrow} ${styles.fadeUp}`}>✦ 3D — Aidan Schreder</p>
            <motion.h1 id="hero-heading" className={`${styles.heroName} ${styles.fadeUp} ${styles.d2}`} style={{ y: nameY }}>
              Aidan
              <br />
              <span className={styles.outline}>Schreder</span>
            </motion.h1>
            <p className={`${styles.heroSub} ${styles.fadeUp} ${styles.d3}`}>Modelling &nbsp;/&nbsp; Rendering &nbsp;/&nbsp; Animation</p>
          </div>

          <div className={`${styles.heroBottom} ${styles.fadeUp} ${styles.d4}`}>
            <motion.p className={styles.tagline} style={{ y: tagY }}>
              Blender environments, hard-surface models, concept design and a short film.
            </motion.p>
            <div className={styles.scrollCue} aria-hidden="true">
              <div className={styles.scrollLine} />
              <span>Scroll</span>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL ── */}
        <div className={styles.interstitial} ref={midRef} aria-hidden="true">
          {showImgs && <FloatImg label="IMG 04" width={320} height={220} top="-100px" left="5%" speed={0.22} scroll={mid} zIndex={2} src="/images/portfolio/08/0.jpg" />}
          {showModels && (
            <FloatModel label="Satellite repair ship" width={700} height={700} top="-100px" left="18%" speed={0.2} scroll={mid} zIndex={2} modelScale={2.2} modelSrc="/models/web/repairship12.glb" />
          )}
          {showImgs && <FloatImg label="IMG 06" width={300} height={200} top="-40px" left="68%" speed={0.35} scroll={mid} src="/images/portfolio/09/0.jpg" />}
          {showImgs && <FloatImg label="IMG 07" width={160} height={160} top="80px" left="82%" speed={0.38} scroll={mid} src="/images/portfolio/15/1.jpg" />}
        </div>

        {/* ── WORK ── */}
        <section className={styles.section} id="work" ref={workRef} aria-labelledby="work-heading">
          <motion.div className={styles.sectionGhost} style={{ y: workGhostY }} aria-hidden="true">
            01
          </motion.div>
          {showImgs && <FloatImg label="IMG 08" width={260} height={170} top="-40px" left="400px" speed={0.2} scroll={work} zIndex={0} src="/images/portfolio/09/4.jpg" />}
          {showImgs && <FloatImg label="IMG 10" width={120} height={190} top="-120px" left="560px" speed={0.22} scroll={work} zIndex={0} src="/images/portfolio/01/0.jpg" />}

          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionNumber}>[ 01 ]</div>
              <motion.h2 id="work-heading" className={styles.sectionTitle} style={{ y: workTitleY }}>
                Work
              </motion.h2>
            </div>
            <div className={styles.sectionMeta}>
              Selected renders
              <br />
              2021 – 2026
            </div>
          </div>

          <Work pieces={pieces} />
        </section>

        {/* ── CLOSE ── */}
        <section className={styles.end} id="contact" ref={endRef}>
          <motion.div className={styles.endGhost} style={{ x: "-50%", y: endGhostY }} aria-hidden="true">
            Render
          </motion.div>
          {showModels && (
            <FloatModel label="Hotel" width={400} height={560} top="40px" left="-20px" speed={0.32} scroll={end} zIndex={3} modelScale={1.7} modelSrc="/models/web/hotel5.glb" />
          )}
          {showImgs && <FloatImg label="IMG 12" width={260} height={260} top="60px" left="76%" speed={-0.18} scroll={end} src="/images/main/watcher.jpg" />}

          <div className={styles.endInner}>
            <p className={styles.endLabel}>[ 02 ] — Contact</p>
            <ContactLine section="3d" className={styles.endContact} />
          </div>
          <FooterLine about="/3d/about" className={styles.endFooter} />
        </section>
      </main>
    </>
  );
}
