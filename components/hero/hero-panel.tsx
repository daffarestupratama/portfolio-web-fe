"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IndonesiaMap } from "@/lib/geo/indonesia";

const BAR_COUNT = 6;
const DONUT_SLICES = 4;
const TICK_MS = 2600;

// ---- Edge "pluck" (guitar-string) physics --------------------------------------
/** Peak perpendicular bow of the control point, in viewBox units. */
const PLUCK_AMPLITUDE = 12;
/** Oscillation frequency (Hz) — ~4 visible swings before it dies out. */
const PLUCK_FREQUENCY = 5.5;
/** Exponential decay constant; with 5.5 the bow is <2% of peak by ~800ms. */
const PLUCK_DECAY = 5.5;
/** Stop animating once the remaining bow is imperceptible. */
const PLUCK_DURATION_MS = 900;
const AUTO_PLUCK_MIN_MS = 1000;
const AUTO_PLUCK_MAX_MS = 2000;
/** Distinct edges plucked per auto tick. */
const AUTO_PLUCKS_PER_TICK = 2;
/** Auto-selection ignores edges shorter than this (viewBox units). The node halos are
 *  r=11, so ~22 units of every edge are hidden beneath its own endpoints: measured on the
 *  current network, Semarang–Yogyakarta (17.5) and Jakarta–Bandung (22.8) are covered
 *  end to end and plucking them reads as nothing happening. The next shortest is
 *  Semarang–Surabaya at 51, comfortably visible, so 40 splits them cleanly. Direct
 *  hover/tap still plucks any edge — this only constrains the random picker. */
const MIN_AUTO_PLUCK_LENGTH = 40;

/** Straight-line path: a quadratic bezier whose control point is the midpoint IS the
 *  straight segment, so the rest state is exact rather than approximated. */
function edgePath(ax: number, ay: number, bx: number, by: number, offset: number): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  if (offset === 0) return `M${ax},${ay} Q${mx},${my} ${bx},${by}`;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  // Unit normal to the edge; the control point rides out along it and back.
  const nx = -dy / len;
  const ny = dx / len;
  // ×2 because a quadratic curve only reaches half way to its control point.
  return `M${ax},${ay} Q${mx + nx * offset * 2},${my + ny * offset * 2} ${bx},${by}`;
}

/** Damped sine: amplitude · sin(2πft) · e^(−λt). */
function pluckOffset(elapsedMs: number): number {
  const t = elapsedMs / 1000;
  return PLUCK_AMPLITUDE * Math.sin(2 * Math.PI * PLUCK_FREQUENCY * t) * Math.exp(-PLUCK_DECAY * t);
}

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

  // --- Pluck engine -------------------------------------------------------------
  // Paths are mutated directly through refs rather than React state: at 60fps a state
  // update per frame would re-render every edge, node and chart in the panel.
  const edgeRefs = useRef<(SVGPathElement | null)[]>([]);
  /** edgeIndex → timestamp the pluck started. Only these are animated. */
  const vibrating = useRef<Map<number, number>>(new Map());
  const frame = useRef(0);
  const onScreen = useRef(true);

  /** Set up in the effect below; the stable `pluck` wrapper delegates to it. */
  const pluckRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A function declaration (not a useCallback) so the loop can re-schedule itself
    // without the memoized-identity problem.
    function step() {
      frame.current = 0;
      const now = performance.now();
      for (const [index, start] of vibrating.current) {
        const el = edgeRefs.current[index];
        const edge = map.edges[index];
        const a = edge && map.nodes[edge[0]];
        const b = edge && map.nodes[edge[1]];
        if (!el || !a || !b) {
          vibrating.current.delete(index);
          continue;
        }
        const elapsed = now - start;
        if (elapsed >= PLUCK_DURATION_MS) {
          // Settle exactly straight so no residual bow is left behind.
          el.setAttribute("d", edgePath(a.x, a.y, b.x, b.y, 0));
          vibrating.current.delete(index);
          continue;
        }
        el.setAttribute("d", edgePath(a.x, a.y, b.x, b.y, pluckOffset(elapsed)));
      }
      if (vibrating.current.size > 0) frame.current = requestAnimationFrame(step);
    }

    pluckRef.current = (index: number) => {
      if (reduced) return; // no vibration at all — hover gets a colour highlight instead
      vibrating.current.set(index, performance.now());
      if (!frame.current) frame.current = requestAnimationFrame(step);
    };

    const vibrations = vibrating.current;
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      vibrations.clear();
    };
  }, [map]);

  const pluck = useCallback((index: number) => pluckRef.current(index), []);

  /** Edges long enough to be worth auto-plucking — see MIN_AUTO_PLUCK_LENGTH. */
  const autoEdges = useMemo(() => {
    const eligible: number[] = [];
    map.edges.forEach(([from, to], i) => {
      const a = map.nodes[from];
      const b = map.nodes[to];
      if (!a || !b) return;
      if (Math.hypot(b.x - a.x, b.y - a.y) >= MIN_AUTO_PLUCK_LENGTH) eligible.push(i);
    });
    return eligible;
  }, [map]);

  // Auto-pluck two edges every 1–2s so the network reads as alive. Math.random() only
  // runs in this client timer, never during render, so hydration stays stable.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (autoEdges.length === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = AUTO_PLUCK_MIN_MS + Math.random() * (AUTO_PLUCK_MAX_MS - AUTO_PLUCK_MIN_MS);
      timer = setTimeout(() => {
        if (onScreen.current) {
          // Partial Fisher–Yates over a copy: draws N *distinct* edges in one pass, where
          // independent draws could pick the same edge twice and waste half the tick.
          const pool = autoEdges.slice();
          const picks = Math.min(AUTO_PLUCKS_PER_TICK, pool.length);
          for (let i = 0; i < picks; i += 1) {
            const j = i + Math.floor(Math.random() * (pool.length - i));
            [pool[i], pool[j]] = [pool[j]!, pool[i]!];
            pluck(pool[i]!);
          }
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [autoEdges, pluck]);

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
      const visible = entries.some((e) => e.isIntersecting);
      // Also gates the auto-pluck timer (see the pluck engine above).
      onScreen.current = visible;
      if (visible) start();
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
              const rest = edgePath(a.x, a.y, b.x, b.y, 0);
              return (
                <g key={i} className="hero-edge-group">
                  {/* Visible string — solid and complete at rest; `d` is mutated by the
                      rAF loop while it's vibrating. */}
                  <path
                    ref={(el) => {
                      edgeRefs.current[i] = el;
                    }}
                    d={rest}
                    className="hero-map-edge"
                  />
                  {/* Wide transparent overlay: the visible line is ~2.6px, far too thin
                      to hit reliably. pointer-events:stroke makes only the band clickable. */}
                  <path
                    d={rest}
                    className="hero-edge-hit"
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") pluck(i);
                    }}
                    onPointerDown={(e) => {
                      // Touch/pen have no hover — a tap plucks instead.
                      if (e.pointerType !== "mouse") pluck(i);
                    }}
                  />
                </g>
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
