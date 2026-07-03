"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hub: boolean;
}

const NODE_COUNT = 26;

function hexToRgba(hex: string, alpha: number): string {
  let h = (hex || "#5AA9D6").trim();
  if (h[0] !== "#") return h;
  if (h.length === 4) h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** 1:1 port of the export's setupGraph()/step()/draw() — a force-directed particle graph. */
export function HeroGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef({ accent: "#5AA9D6", accent2: "#7FC0E2" });
  const drawRef = useRef<() => void>(() => {});
  const { resolvedTheme } = useTheme();

  // Keep the live accent colors in sync with the theme; re-draw immediately
  // so a static (reduced-motion) frame also updates on theme toggle.
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    colorsRef.current = {
      accent: styles.getPropertyValue("--accent").trim() || "#5AA9D6",
      accent2: styles.getPropertyValue("--accent-2").trim() || "#7FC0E2",
    };
    drawRef.current();
  }, [resolvedTheme]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const nodes: GraphNode[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const hub = i % 5 === 0;
      nodes.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.2 + Math.random() * 0.6,
        vx: 0,
        vy: 0,
        r: hub ? 4.4 : 2.2,
        hub,
      });
    }

    let edges: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const distances: [number, number][] = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        distances.push([dx * dx + dy * dy, j]);
      }
      distances.sort((a, b) => a[0] - b[0]);
      const k = nodes[i].hub ? 3 : 2;
      for (let m = 0; m < k; m++) {
        const j = distances[m][1];
        edges.push(i < j ? [i, j] : [j, i]);
      }
    }
    const seen = new Set<string>();
    edges = edges.filter(([a, b]) => {
      const key = `${a}-${b}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const mouse = { x: -1, y: -1, active: false };
    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.active = true;
    };
    const onPointerLeave = () => {
      mouse.active = false;
    };
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      // Resizing the canvas backing store clears its pixels. The animated
      // (rAF loop) case repaints every frame regardless, but under reduced
      // motion draw() only ever runs once — without a redraw here, the
      // ResizeObserver's initial fire (which happens even when the size
      // hasn't visibly changed) would wipe that single static frame blank.
      resizeRaf = requestAnimationFrame(() => {
        resize();
        drawRef.current();
      });
    });
    ro.observe(wrap);
    resize();

    const step = () => {
      for (let i = 0; i < NODE_COUNT; i++) {
        let fx = 0;
        let fy = 0;
        for (let j = 0; j < NODE_COUNT; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy + 0.0002;
          const d = Math.sqrt(d2);
          const rep = 0.0001 / d2;
          fx += (dx / d) * rep;
          fy += (dy / d) * rep;
        }
        fx += (0.5 - nodes[i].x) * 0.001;
        fy += (0.5 - nodes[i].y) * 0.001;
        if (mouse.active) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const d2 = dx * dx + dy * dy + 0.0004;
          if (d2 < 0.045) {
            const d = Math.sqrt(d2);
            const rep = 0.0009 / d2;
            fx += (dx / d) * rep;
            fy += (dy / d) * rep;
          }
        }
        nodes[i].vx = (nodes[i].vx + fx) * 0.85;
        nodes[i].vy = (nodes[i].vy + fy) * 0.85;
      }
      for (const [a, b] of edges) {
        const dx = nodes[b].x - nodes[a].x;
        const dy = nodes[b].y - nodes[a].y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        const f = (d - 0.17) * 0.004;
        nodes[a].vx += (dx / d) * f;
        nodes[a].vy += (dy / d) * f;
        nodes[b].vx -= (dx / d) * f;
        nodes[b].vy -= (dy / d) * f;
      }
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;
        if (nodes[i].x < 0.05) {
          nodes[i].x = 0.05;
          nodes[i].vx *= -0.5;
        }
        if (nodes[i].x > 0.95) {
          nodes[i].x = 0.95;
          nodes[i].vx *= -0.5;
        }
        if (nodes[i].y < 0.06) {
          nodes[i].y = 0.06;
          nodes[i].vy *= -0.5;
        }
        if (nodes[i].y > 0.94) {
          nodes[i].y = 0.94;
          nodes[i].vy *= -0.5;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const { accent, accent2 } = colorsRef.current;
      for (const [a, b] of edges) {
        const ax = nodes[a].x * width;
        const ay = nodes[a].y * height;
        const bx = nodes[b].x * width;
        const by = nodes[b].y * height;
        const dist = Math.hypot(ax - bx, ay - by);
        const alpha = Math.max(0, 0.55 - dist / (width * 0.85));
        ctx.strokeStyle = hexToRgba(accent, 0.14 + alpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      for (let i = 0; i < NODE_COUNT; i++) {
        const x = nodes[i].x * width;
        const y = nodes[i].y * height;
        const r = nodes[i].r;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5);
        glow.addColorStop(0, hexToRgba(nodes[i].hub ? accent2 : accent, 0.45));
        glow.addColorStop(1, hexToRgba(accent, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r * 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = nodes[i].hub ? accent2 : accent;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hexToRgba("#ffffff", 0.85);
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawRef.current = draw;

    for (let k = 0; k < 60; k++) step();

    let raf = 0;
    if (reduce) {
      draw();
    } else {
      const loop = () => {
        step();
        draw();
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      drawRef.current = () => {};
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative z-[1] w-full overflow-hidden"
      style={{
        aspectRatio: "1 / 0.92",
        borderRadius: 16,
        background: "radial-gradient(circle at 50% 42%, var(--chip), transparent 72%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
    </div>
  );
}
