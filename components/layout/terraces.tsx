"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * 2a's "Terraces" background: nested concave rings scattered down the page, drifting and
 * breathing. A verbatim port of 2a's `decoEl(H, vw)`.
 *
 * Deterministic: every number comes from the seeded hash `R(i)` below, never Math.random,
 * so the same height and width always produce the same rings. Those two inputs are only
 * known in the browser, though, so the rings are built client-side after mount: the server
 * renders the empty layer, there is no hydration mismatch, and no server CPU is spent.
 * The animation is pure CSS (decoDrift / decoBreathe in globals.css), and 2a's own
 * `[data-deco] *` rule stops it under prefers-reduced-motion.
 */

const R = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface Item {
  top: number;
  side: "left" | "right";
  off: number;
  size: number;
  rad: number;
  n: number;
  rot: number;
}

/** 2a rebuilds only when this bucketed key changes, not on every pixel of resize. */
const bucket = (H: number, vw: number) => `${Math.round(H / 200)}:${vw < 720 ? "s" : "l"}:${Math.round(vw / 200)}`;

/** 2a only accepts a new height once it moves by more than this. */
const HEIGHT_SLACK = 150;

function buildTerraces(H: number, vw: number): ReactNode[] {
  const sm = vw < 720 ? 0.62 : 1;
  const items: Item[] = [{ top: -150, side: "right", off: -170, size: 640, rad: 50, n: 5, rot: 0 }];
  let y = 1060;
  let i = 1;
  while (y < H - 160 && i < 60) {
    const r = (j: number) => R(i * 7 + j);
    const size = Math.round(260 + r(1) * 380);
    const circle = r(2) < 0.45;
    const off = r(3) < 0.22 ? Math.round(vw * 0.03) : -Math.round(size * sm * (0.26 + r(4) * 0.3));
    items.push({
      top: y,
      side: i % 2 ? "left" : "right",
      off,
      size,
      rad: circle ? 50 : Math.round(32 + r(5) * 10),
      n: 3 + Math.floor(r(6) * 3),
      rot: Math.round((r(7) - 0.5) * 40),
    });
    y += Math.round(820 + r(8) * 420 + size * 0.25);
    i++;
  }

  return items.map((it, idx) => {
    const r = (j: number) => R(idx * 13 + j + 500);
    const S = Math.round(it.size * sm);
    const pad = Math.round(S * (it.n > 4 ? 0.072 : 0.085));
    let inner: ReactNode = null;
    for (let k = it.n - 1; k >= 0; k--) {
      const st: Record<string, string | number> = {
        borderRadius: it.rad === 50 ? "50%" : `${Math.max(24, it.rad - k * 2)}%`,
        padding: k === it.n - 1 ? 0 : pad,
        boxShadow: "var(--in-deco)",
      };
      if (k > 0) {
        Object.assign(st, {
          width: "100%",
          height: "100%",
          animation: `decoBreathe ${(7 + r(k) * 9).toFixed(1)}s ease-in-out ${(-r(k + 9) * 12).toFixed(1)}s infinite`,
          "--s": (0.95 + r(k + 20) * 0.08).toFixed(3),
        });
      } else {
        Object.assign(st, {
          position: "absolute",
          top: it.top,
          [it.side]: it.off,
          width: S,
          aspectRatio: "1",
          transform: `rotate(${it.rot}deg)`,
          willChange: "transform",
          animation: `decoDrift ${(18 + r(31) * 14).toFixed(1)}s ease-in-out ${(-r(32) * 20).toFixed(1)}s infinite`,
          "--dx": `${Math.round((r(33) - 0.5) * 60)}px`,
          "--dy": `${Math.round((r(34) - 0.5) * 48)}px`,
          "--r0": `${it.rot}deg`,
          "--r1": `${Math.round(it.rot + (r(35) < 0.5 ? -1 : 1) * (14 + r(36) * 18))}deg`,
        });
      }
      inner = (
        <div key={k} style={st as CSSProperties}>
          {inner}
        </div>
      );
    }
    return <Fragment key={idx}>{inner}</Fragment>;
  });
}

export function Terraces() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // The H and vw the current rings were built from. Null until measured on the client.
  const [dims, setDims] = useState<{ H: number; vw: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let H = -Infinity;
    let key = "";
    const measure = () => {
      const h = el.offsetHeight;
      if (Math.abs(h - H) > HEIGHT_SLACK) H = h;
      const vw = window.innerWidth;
      const next = bucket(H, vw);
      if (next !== key) {
        key = next;
        setDims({ H, vw });
      }
    };
    // ResizeObserver also fires once on observe, which takes the first measurement.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rings = useMemo(() => (dims ? buildTerraces(dims.H, dims.vw) : null), [dims]);

  return (
    <div
      ref={ref}
      data-deco="1"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      // 2a dims the terraces behind long-form reading.
      style={{ opacity: pathname.startsWith("/articles/") ? 0.4 : 1 }}
    >
      {rings}
    </div>
  );
}
