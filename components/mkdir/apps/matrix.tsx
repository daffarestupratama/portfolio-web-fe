"use client";

import { useEffect, useRef } from "react";
import type { TermApp } from "../terminal-types";

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺﾊﾋﾌﾍﾎ0123456789<>/{}[]=+*".split("");

function MatrixApp({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  // Any key or tap/click exits (matrix's own affordance; the overlay also offers Esc).
  // Attach on a short delay so the keypress that LAUNCHED matrix (still propagating to
  // window when React flushes this mount effect during the discrete event) doesn't
  // instantly close it.
  useEffect(() => {
    const exit = () => onExitRef.current();
    const id = window.setTimeout(() => {
      window.addEventListener("keydown", exit);
      window.addEventListener("pointerdown", exit);
    }, 80);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", exit);
      window.removeEventListener("pointerdown", exit);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = 15;
    let width = 0;
    let height = 0;
    let drops: number[] = [];

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.floor(width / fontSize));
      drops = Array.from({ length: cols }, () => Math.floor((Math.random() * height) / fontSize));
    };
    resize();

    ctx.fillStyle = "#05080b";
    ctx.fillRect(0, 0, width, height);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const drawFrame = () => {
      ctx.fillStyle = "rgba(5, 8, 11, 0.10)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px var(--font-mono), monospace`;
      for (let i = 0; i < drops.length; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
        const x = i * fontSize;
        const y = drops[i]! * fontSize;
        ctx.fillStyle = Math.random() > 0.94 ? "#c8ffdd" : "#3fe081";
        ctx.fillText(glyph, x, y);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        else drops[i]!++;
      }
      raf = requestAnimationFrame(drawFrame);
    };

    if (reduced) {
      // Static frame only — respect prefers-reduced-motion.
      ctx.font = `${fontSize}px var(--font-mono), monospace`;
      ctx.fillStyle = "#3fe081";
      const rows = Math.floor(height / fontSize);
      for (let c = 0; c < drops.length; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.72) {
            ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!, c * fontSize, r * fontSize);
          }
        }
      }
    } else {
      raf = requestAnimationFrame(drawFrame);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="term-matrix" role="img" aria-label="Matrix character rain animation">
      <canvas ref={canvasRef} />
    </div>
  );
}

/** App-runner entry for `matrix`. Phase 3's game plugs into the same TermApp seam. */
export function matrixApp(): TermApp {
  return {
    id: "matrix",
    title: "matrix",
    render: (onExit) => <MatrixApp onExit={onExit} />,
  };
}
