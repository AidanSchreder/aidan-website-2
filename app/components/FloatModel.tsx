"use client";

// ── FLOAT MODEL COMPONENT ─────────────────────────────────────────────────────
// Extracted from page.tsx to enable next/dynamic import.
// Place this file at: app/components/FloatModel.tsx
//
// By being in its own file, page.tsx can dynamically import this with:
//   const FloatModel = dynamic(() => import("./components/FloatModel"), { ssr: false });
//
// This removes the entire Three.js bundle (~600kb) from the initial page load.
// The models load in after the page is interactive, which is the correct
// behaviour since they are decorative parallax elements, not critical content.

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface FloatModelProps {
  label: string;
  width: number;
  height: number;
  top: string;
  left: string;
  rotation: number;
  speed: number;
  scrollY: number;
  zIndex?: number;
  modelSrc?: string;
  cameraZ?: number;
  modelScale?: number;
  isDark: boolean;
}

// Shared geometry/material cache — multiple default cubes share one GPU upload
let _defaultGeo: THREE.BufferGeometry | null = null;
let _defaultMat: THREE.MeshStandardMaterial | null = null;

function getDefaultGeometry(): THREE.BufferGeometry {
  if (!_defaultGeo) _defaultGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  return _defaultGeo;
}

function getDefaultMaterial(isDark: boolean): THREE.MeshStandardMaterial {
  if (!_defaultMat) {
    _defaultMat = new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.3 });
  }
  _defaultMat.color.setHex(isDark ? 0xffffff : 0x111111);
  return _defaultMat;
}

export default function FloatModel({
  label, width, height, top, left, rotation, speed, scrollY,
  zIndex = 1, modelSrc, isDark, cameraZ = 3.5, modelScale = 1.0,
}: FloatModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{
    renderer:    THREE.WebGLRenderer | null;
    scene:       THREE.Scene | null;
    camera:      THREE.PerspectiveCamera | null;
    mesh:        THREE.Object3D | null;
    rafId:       number;
    needsRender: boolean;
    fadeProgress: number;
    drag:        { active: boolean; lastX: number; lastY: number };
    velX: number; velY: number;
    rotX: number; rotY: number;
    observer:    IntersectionObserver | null;
    visible:     boolean;
  }>({
    renderer: null, scene: null, camera: null, mesh: null,
    rafId: 0, needsRender: true,
    fadeProgress: 0,
    drag: { active: false, lastX: 0, lastY: 0 },
    velX: 0, velY: 0, rotX: 0.4, rotY: 0.4,
    observer: null, visible: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = stateRef.current;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    s.renderer = renderer;

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);
    s.scene  = scene;
    s.camera = camera;

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-4, -2, -3);
    scene.add(fill);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const buildDefaultCube = () => {
      const mesh = new THREE.Mesh(getDefaultGeometry(), getDefaultMaterial(isDark));
      scene.add(mesh);
      s.mesh = mesh;
      s.needsRender = true;
    };

    const addModelToScene = (model: THREE.Object3D) => {
      const box    = new THREE.Box3().setFromObject(model);
      const centre = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3()).length();
      model.position.sub(centre);
      model.scale.multiplyScalar((2.4 / size) * modelScale);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            (mat as THREE.MeshStandardMaterial).transparent = true;
            (mat as THREE.MeshStandardMaterial).opacity     = 0;
          });
        }
      });

      scene.add(model);
      s.mesh         = model;
      s.fadeProgress = 0;
      s.needsRender  = true;
    };

    // ── Load model or build cube ───────────────────────────────────────────────
    if (modelSrc) {
      import("three/examples/jsm/loaders/GLTFLoader")
        .then(({ GLTFLoader }) => {
          const loader = new GLTFLoader();
          loader.load(
            modelSrc,
            (gltf) => { addModelToScene(gltf.scene); },
            undefined,
            (err) => {
              console.error(
                `[FloatModel] Failed to load "${modelSrc}".`,
                "\nMake sure the file is in /public (e.g. /public/models/foo.glb)",
                "\nand that modelSrc starts with / (e.g. modelSrc=\"/models/foo.glb\").",
                "\nOriginal error:", err
              );
              buildDefaultCube();
            }
          );
        })
        .catch((importErr) => {
          console.error(
            "[FloatModel] Could not import GLTFLoader. Make sure `three` is installed:",
            "\n  npm install three @types/three",
            "\nOriginal error:", importErr
          );
          buildDefaultCube();
        });
    } else {
      buildDefaultCube();
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    const FADE_SPEED = 0.03;
    const tick = () => {
      s.rafId = requestAnimationFrame(tick);
      if (!s.visible) return;

      if (s.mesh && s.fadeProgress < 1) {
        s.fadeProgress = Math.min(1, s.fadeProgress + FADE_SPEED);
        const opacity = s.fadeProgress * s.fadeProgress * (3 - 2 * s.fadeProgress);
        s.mesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mats = Array.isArray((child as THREE.Mesh).material)
              ? (child as THREE.Mesh).material as THREE.Material[]
              : [(child as THREE.Mesh).material as THREE.Material];
            mats.forEach((m) => { (m as THREE.MeshStandardMaterial).opacity = opacity; });
          }
        });
        s.needsRender = true;
      }

      if (!s.drag.active && (Math.abs(s.velX) > 0.0001 || Math.abs(s.velY) > 0.0001)) {
        s.rotX += s.velY;
        s.rotY += s.velX;
        s.velX *= 0.88;
        s.velY *= 0.88;
        s.needsRender = true;
      }

      if (s.mesh) {
        s.mesh.rotation.x = s.rotX;
        s.mesh.rotation.y = s.rotY;
      }

      if (s.needsRender) {
        renderer.render(scene, camera);
        s.needsRender = false;
      }
    };
    s.rafId = requestAnimationFrame(tick);

    // ── IntersectionObserver ──────────────────────────────────────────────────
    s.observer = new IntersectionObserver(
      ([entry]) => { s.visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    s.observer.observe(canvas);

    // ── Pointer drag ──────────────────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      s.drag.active = true;
      s.drag.lastX  = e.clientX;
      s.drag.lastY  = e.clientY;
      s.velX = s.velY = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.drag.active) return;
      const dx      = e.clientX - s.drag.lastX;
      const dy      = e.clientY - s.drag.lastY;
      s.velX        = dx * 0.008;
      s.velY        = dy * 0.008;
      s.rotY       += s.velX;
      s.rotX       += s.velY;
      s.drag.lastX  = e.clientX;
      s.drag.lastY  = e.clientY;
      s.needsRender = true;
    };
    const onUp = () => { s.drag.active = false; };

    canvas.addEventListener("pointerdown",   onDown);
    canvas.addEventListener("pointermove",   onMove);
    canvas.addEventListener("pointerup",     onUp);
    canvas.addEventListener("pointercancel", onUp);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(s.rafId);
      s.observer?.disconnect();
      canvas.removeEventListener("pointerdown",   onDown);
      canvas.removeEventListener("pointermove",   onMove);
      canvas.removeEventListener("pointerup",     onUp);
      canvas.removeEventListener("pointercancel", onUp);
      renderer.dispose();
      s.renderer = null;
      s.scene    = null;
      s.camera   = null;
      s.mesh     = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, modelSrc]);

  // Theme colour update — no renderer rebuild needed
  useEffect(() => {
    if (!modelSrc && stateRef.current.mesh) {
      getDefaultMaterial(isDark);
      stateRef.current.needsRender = true;
    }
  }, [isDark, modelSrc]);

  return (
    <div
      className="float-img"
      style={{
        position: "absolute", top, left, width, height,
        transform: `rotate(${rotation}deg) translateY(${scrollY * speed}px)`,
        zIndex,
        willChange: "transform",
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        aria-label={label}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
          cursor: "grab",
          touchAction: "none",
        }}
      />
    </div>
  );
}
