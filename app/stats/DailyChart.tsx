"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./stats.module.css";

interface Point {
  day: string;
  visitors: number;
  views: number;
}

const H = 220;
const PAD = { top: 14, right: 8, bottom: 28, left: 44 };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const mag = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= v / 2)! * mag;
  return Math.ceil(v / step) * step;
}

const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

/** Column path with a 4px rounded data-end and a square baseline. */
function column(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function DailyChart({ data, scopeLabel }: { data: Point[]; scopeLabel: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(0, ...data.map((d) => d.visitors)));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const slot = data.length ? plotW / data.length : 0;
  const bw = Math.max(1, Math.min(24, slot - 2));
  const ticks = [0, max / 2, max];
  const labelIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const a = active !== null ? data[active] : null;

  return (
    <div
      ref={wrap}
      className={styles.chart}
      tabIndex={0}
      role="img"
      aria-label={`Daily visitors, ${scopeLabel}. Use left and right arrow keys to read each day.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setActive((i) => Math.min(data.length - 1, (i ?? -1) + 1));
        if (e.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? data.length) - 1));
      }}
      onBlur={() => setActive(null)}
      onPointerLeave={() => setActive(null)}
    >
      {width > 0 && (
        <svg width={width} height={H} aria-hidden="true">
          {ticks.map((t) => {
            const y = PAD.top + plotH - (t / max) * plotH;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} className={styles.grid} />
                <text x={PAD.left - 8} y={y} dy="0.32em" textAnchor="end" className={styles.tick}>
                  {t.toLocaleString("en-CA")}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.visitors / max) * plotH;
            const x = PAD.left + i * slot + (slot - bw) / 2;
            return (
              <g key={d.day}>
                {h > 0 && <path d={column(x, PAD.top + plotH - h, bw, h)} className={styles.bar} data-active={active === i || undefined} />}
                <rect
                  x={PAD.left + i * slot}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setActive(i)}
                />
              </g>
            );
          })}
          {labelIdx.map((i, n) =>
            data[i] ? (
              <text
                key={n}
                x={PAD.left + i * slot + slot / 2}
                y={H - 8}
                textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"}
                className={styles.tick}
              >
                {fmtDay(data[i].day)}
              </text>
            ) : null,
          )}
        </svg>
      )}

      {a && active !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(Math.max(PAD.left + active * slot + slot / 2, 80), width - 80),
            top: PAD.top + plotH - (a.visitors / max) * plotH,
          }}
        >
          <strong>{a.visitors.toLocaleString("en-CA")} visitors</strong>
          <span>{a.views.toLocaleString("en-CA")} page views</span>
          <span>{fmtDay(a.day)}</span>
        </div>
      )}
    </div>
  );
}
