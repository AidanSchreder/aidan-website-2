"use client";

// ── FLOAT IMAGE COMPONENT ─────────────────────────────────────────────────────
// Extracted from page.tsx for dynamic import support.
// Place this file at: app/components/FloatImg.tsx
//
// Uses next/image instead of <img> for automatic:
//   - WebP/AVIF conversion
//   - Lazy loading
//   - Layout shift prevention
//   - Responsive srcset generation
//
// The parent div has explicit pixel dimensions (width × height props) so
// next/image fill mode works correctly — no layout shift, no aspect ratio issues.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface FloatImgProps {
  label: string;
  width: number;
  height: number;
  top: string;
  left: string;
  rotation: number;
  speed: number;
  scrollY: number;
  zIndex?: number;
  src?: string;
}

export default function FloatImg({
  label, width, height, top, left, rotation, speed, scrollY, zIndex = 1, src,
}: FloatImgProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Window-level mousemove with manual bounds check — elementsFromPoint skips
  // elements with pointer-events:none, so we check the rect directly instead.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setHovered(
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top  && e.clientY <= r.bottom
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Derive a short ref code from the label, e.g. "IMG 02" → "REF·02"
  const refCode = label.replace(/IMG\s*/i, "REF·");

  return (
    <div
      className="float-img"
      style={{
        position: "absolute",
        top,
        left,
        width,
        height,
        transform: `rotate(${rotation}deg) translateY(${scrollY * speed}px)`,
        zIndex,
        willChange: "transform",
      }}
    >
      <div className={`float-img-inner${hovered ? " float-img-inner-hovered" : ""}`}>

        {/* ── Registration marks ── */}
        <svg
          className={`float-img-marks${hovered ? " float-img-marks-hovered" : ""}`}
          style={{ position: "absolute", inset: "-10px", width: "calc(100% + 20px)", height: "calc(100% + 20px)", overflow: "visible", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <polyline points="18,8 8,8 8,18" />
          <polyline points={`${width + 2},8 ${width + 12},8 ${width + 12},18`} />
          <polyline points={`18,${height + 12} 8,${height + 12} 8,${height + 2}`} />
          <polyline points={`${width + 2},${height + 12} ${width + 12},${height + 12} ${width + 12},${height + 2}`} />
        </svg>

        {/* ── Metadata label ── */}
        <div className={`float-img-meta${hovered ? " float-img-meta-hovered" : ""}`}>
          <span className="float-img-meta-label">{refCode}</span>
          <span className="float-img-meta-sep">·</span>
          <span className="float-img-meta-dims">{width}×{height}</span>
        </div>

        <div ref={wrapRef} className={`float-img-hover-wrap${hovered ? " float-img-hovered" : ""}`}>
          {src ? (
            // next/image with fill — parent div has explicit pixel dimensions
            // so fill resolves correctly. sizes tells the browser the rendered
            // width so it can pick the right srcset entry.
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src={src}
                alt={label}
                fill
                sizes={`${width}px`}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <div className="float-img-placeholder">
              <span className="float-img-label">{label}</span>
              <span className="float-img-hint">Replace with image</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
