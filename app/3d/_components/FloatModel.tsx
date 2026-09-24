"use client";

// Drag-to-spin GLB model from v1, now:
//   - loads meshopt-compressed models from /3d/models (≈90% smaller)
//   - waits to fetch until the canvas is within ~one screen of the viewport
//   - pauses rendering while off-screen
//   - parallax via a motion value instead of React state

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useTransform, type MotionValue } from "framer-motion";
import styles from "../three-d.module.css";

export interface FloatModelProps {
  label: string;
  width: number;
  height: number;
  top: string;
  left: string;
  speed: number;
  scroll: MotionValue<number>;
  zIndex?: number;
  modelSrc: string;
  cameraZ?: number;
  modelScale?: number;
}

export default function FloatModel({
  label,
  width,
  height,
  top,
  left,
  speed,
  scroll,
  zIndex = 1,
  modelSrc,
  cameraZ = 7.5,
  modelScale = 1,
}: FloatModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const y = useTransform(scroll, (v) => v * speed);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-4, -2, -3);
    scene.add(fill);

    const s = {
      mesh: null as THREE.Object3D | null,
      materials: [] as THREE.Material[],
      fade: 0,
      dirty: true,
      visible: false,
      loading: false,
      disposed: false,
      drag: { active: false, x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      rot: { x: 0.4, y: 0.4 },
      raf: 0,
    };

    const load = async () => {
      s.loading = true;
      try {
        const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/libs/meshopt_decoder.module.js"),
        ]);
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.loadAsync(modelSrc);
        if (s.disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));
        model.scale.multiplyScalar((2.4 / box.getSize(new THREE.Vector3()).length()) * modelScale);
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            m.transparent = true;
            m.opacity = 0;
            s.materials.push(m);
          }
        });
        scene.add(model);
        s.mesh = model;
        s.dirty = true;
      } catch (err) {
        console.error(`[FloatModel] Failed to load ${modelSrc}`, err);
      }
    };

    const tick = () => {
      s.raf = requestAnimationFrame(tick);
      if (!s.visible || !s.mesh) return;
      if (s.fade < 1) {
        s.fade = Math.min(1, s.fade + 0.03);
        const o = s.fade * s.fade * (3 - 2 * s.fade);
        for (const m of s.materials) m.opacity = o;
        if (s.fade === 1) for (const m of s.materials) m.transparent = false;
        s.dirty = true;
      }
      if (!s.drag.active && (Math.abs(s.vel.x) > 1e-4 || Math.abs(s.vel.y) > 1e-4)) {
        s.rot.x += s.vel.y;
        s.rot.y += s.vel.x;
        s.vel.x *= 0.88;
        s.vel.y *= 0.88;
        s.dirty = true;
      }
      if (s.dirty) {
        s.mesh.rotation.set(s.rot.x, s.rot.y, 0);
        renderer.render(scene, camera);
        s.dirty = false;
      }
    };
    s.raf = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible) s.dirty = true;
        if (s.visible && !s.loading) load();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(canvas);

    const down = (e: PointerEvent) => {
      s.drag = { active: true, x: e.clientX, y: e.clientY };
      s.vel = { x: 0, y: 0 };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!s.drag.active) return;
      s.vel = { x: (e.clientX - s.drag.x) * 0.008, y: (e.clientY - s.drag.y) * 0.008 };
      s.rot.y += s.vel.x;
      s.rot.x += s.vel.y;
      s.drag.x = e.clientX;
      s.drag.y = e.clientY;
      s.dirty = true;
    };
    const up = () => {
      s.drag.active = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      s.disposed = true;
      cancelAnimationFrame(s.raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      s.materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [width, height, modelSrc, cameraZ, modelScale]);

  return (
    <motion.div className={styles.model} style={{ top, left, width, height, zIndex, y }}>
      <canvas ref={canvasRef} width={width} height={height} aria-label={`${label}: drag to rotate`} />
    </motion.div>
  );
}
