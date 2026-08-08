"use client";

import { useEffect, useRef, useState } from "react";
import type { IndonesiaMap } from "@/lib/geo/indonesia";
import { edgePulse } from "./hero-cities";

const BAR_COUNT = 6;
const DONUT_SLICES = 4;
const TICK_MS = 2600;

/** Deterministic first frame — identical on server and client, so no hydration mismatch.
 *  Also the single static state rendered under prefers-reduced-motion. */
const INITIAL_BARS = [0.45, 0.72, 0.38, 0.9, 0.6, 0.8];
const INITIAL_SLICES = [0.34, 0.26, 0.22, 0.18];

function randomBars(): number[] {
  return Array.from({ length: BAR_COUNT }, () => 0.25 + Math.random() * 0.75);
}

function randomSlices(): number[] {
  const raw = Array.from({ length: DONUT_SLICES }, () => 0.15 + Math.random());
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / total);
}

const DONUT_R = 15.5;
const DONUT_C = 2 * Math.PI * DONUT_R;
const SLICE_TONES = ["var(--accent)", "var(--accent-2)", "var(--green)", "var(--teal)"];

export function HeroPanel({ map }: { map: IndonesiaMap }) {
  const [bars, setBars] = useState(INITIAL_BARS);
  const [slices, setSlices] = useState(INITIAL_SLICES);
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** Pointer type of the most recent press, so click-toggle only applies to touch/pen. */
  const lastPointer = useRef<string>("mouse");

  // Animate only while the panel is on screen, and never under reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        setBars(randomBars());
        setSlices(randomSlices());
      }, TICK_MS);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) start();
      else stop();
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const activeNode = active !== null ? map.nodes[active] : null;

  return (
    <div ref={rootRef} className="relative z-[2]">
      {/* ---------- Map ---------- */}
      <div className="relative">
        <svg
          viewBox={map.viewBox}
          className="block h-auto w-full"
          role="img"
          aria-label="Map of Indonesia with a network of major cities"
        >
          {/* Injected as one pre-serialised string rather than ~321 React <path> elements:
              measured ~6.3ms vs ~0.02ms of server CPU (the cost scales with element count),
              which matters on the Workers free plan's 10ms budget. Content is build-time
              generated numeric path data — see lib/geo/indonesia-geometry.ts. */}
          <g className="hero-map-land" dangerouslySetInnerHTML={{ __html: map.markup }} />

          <g className="hero-map-edges">
            {map.edges.map(([from, to], i) => {
              const a = map.nodes[from];
              const b = map.nodes[to];
              if (!a || !b) return null;
              const pulse = edgePulse(i, map.edges.length);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="hero-map-edge"
                  // Normalises every edge to 100 units regardless of real length, so one
                  // dash of fixed proportion is always somewhere on the line — short and
                  // long edges pulse identically and none ever sits visibly empty.
                  pathLength={100}
                  style={{
                    // 3dp so two edges never round to the same duration.
                    animationDuration: `${pulse.duration.toFixed(3)}s`,
                    animationDelay: `${pulse.delay.toFixed(3)}s`,
                    animationDirection: pulse.reversed ? "alternate-reverse" : "alternate",
                  }}
                />
              );
            })}
          </g>

          <g>
            {map.nodes.map((node, i) => (
              <g
                key={node.name}
                role="button"
                tabIndex={0}
                aria-label={node.name}
                className="hero-map-node"
                data-active={active === i || undefined}
                // Pointer-type aware (same reason as TechTile): on touch, Chrome emits
                // compatibility mouseenter AFTER pointerdown, so hover+click would cancel
                // each other out. Hover is mouse-only; tap-toggle is touch-only.
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setActive(i);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") setActive((cur) => (cur === i ? null : cur));
                }}
                // Only *keyboard* focus reveals the popup: a tap also focuses the node, and
                // an unconditional show here would be toggled straight back off by the
                // click that follows, making the first tap appear to do nothing.
                onFocus={(e) => {
                  if (e.currentTarget.matches(":focus-visible")) setActive(i);
                }}
                onBlur={() => setActive((cur) => (cur === i ? null : cur))}
                onClick={() => {
                  if (lastPointer.current !== "mouse") setActive((cur) => (cur === i ? null : i));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive((cur) => (cur === i ? null : i));
                  }
                }}
              >
                {/* Generous invisible hit area, larger than the visible dot. */}
                <circle cx={node.x} cy={node.y} r={16} fill="transparent" />
                <circle cx={node.x} cy={node.y} r={11} className="hero-node-halo" />
                <circle cx={node.x} cy={node.y} r={5.5} className="hero-node-dot" />
              </g>
            ))}
          </g>
        </svg>

        {/* City popup. An HTML overlay (crisp text at any scale) positioned from the
            node's viewBox coordinates and clamped horizontally so edge cities like
            Medan and Jayapura stay fully inside the panel instead of being cut off. */}
        {activeNode && (
          <span
            className="hero-city-popup mono"
            style={{
              left: `${Math.min(Math.max((activeNode.x / map.width) * 100, 12), 88)}%`,
              top: `${(activeNode.y / map.height) * 100}%`,
            }}
          >
            {activeNode.name}
          </span>
        )}
      </div>

      {/* ---------- Charts (decorative — deliberately unlabelled) ---------- */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1.55fr_1fr]">
        <div
          className="px-3 py-2.5"
          style={{ borderRadius: 13, background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
        >
          <div className="mono mb-1.5 text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--ink-faint)" }}>
            throughput
          </div>
          <svg viewBox="0 0 120 34" className="block h-auto w-full" aria-hidden="true">
            {bars.map((v, i) => (
              <rect
                key={i}
                // 6 bars: pitch 21 × 5 + width 15 = exactly the 120-unit viewBox.
                x={i * 21}
                y={0}
                width={15}
                height={34}
                className="hero-bar"
                // scaleY from the bottom edge: universally supported, unlike CSS
                // transitions on the SVG `y`/`height` geometry properties.
                style={{ transform: `scaleY(${v})`, fill: i % 2 === 0 ? "var(--accent)" : "var(--accent-2)" }}
              />
            ))}
          </svg>
        </div>

        {/* Hidden below 640px: map + two charts would make the hero far too tall. */}
        <div
          className="hidden flex-col items-center px-3 py-2.5 sm:flex"
          style={{ borderRadius: 13, background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
        >
          <div
            className="mono mb-1.5 self-start text-[10px] tracking-[0.14em] uppercase"
            style={{ color: "var(--ink-faint)" }}
          >
            mix
          </div>
          <svg viewBox="0 0 44 44" className="block h-[76px] w-[76px]" aria-hidden="true">
            <circle cx={22} cy={22} r={DONUT_R} className="hero-donut-track" />
            {slices.map((v, i) => {
              const offset = slices.slice(0, i).reduce((a, b) => a + b, 0);
              return (
                <circle
                  key={i}
                  cx={22}
                  cy={22}
                  r={DONUT_R}
                  className="hero-donut-slice"
                  style={{
                    stroke: SLICE_TONES[i % SLICE_TONES.length],
                    strokeDasharray: `${(v * DONUT_C).toFixed(2)} ${DONUT_C.toFixed(2)}`,
                    strokeDashoffset: `${(-offset * DONUT_C).toFixed(2)}`,
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
