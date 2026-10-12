"use client";

import { useEffect, useRef, useState } from "react";

/** 2a's zigzag: 14 alternating strokes across a 100×40 box, drawn behind the first word. */
const ZIGZAG =
  "M2 33" + Array.from({ length: 14 }, (_, i) => ` L${(2 + (i + 1) * (96 / 14)).toFixed(1)} ${i % 2 ? 33 : 7}`).join("");

/**
 * The hero name as Portfolio 2a types it: letters appear one by one, a zigzag highlight sweeps
 * under the first word, holds, sweeps back, the name is deleted, and the loop repeats.
 *
 * The typing is purely visual. Three layers share one box:
 *  - an sr-only copy, the only one assistive tech reads, so the h1 is announced once and whole;
 *  - an invisible sizer copy that reserves the final two-line box, so nothing reflows while typing;
 *  - an aria-hidden overlay that shows the typed prefix, the highlight and the caret.
 * The full name is therefore in the server HTML twice (sr-only and sizer), which is what search
 * engines index. Under prefers-reduced-motion, CSS (globals.css, `.hn`) shows the sizer instead
 * of the overlay, so the complete name is visible on first paint, before any script runs.
 */
export function HeroName({ text }: { text: string }) {
  const [n, setN] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!text) return;
    // Reduced motion: CSS already shows the full name (the sizer) and hides this overlay.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    // Paused while the name is off screen or the tab is hidden: nobody sees it, so it does no
    // work, and it carries on from the same letter when it comes back.
    let visible = true;
    let resume: (() => void) | null = null;
    const paused = () => !visible || document.hidden;
    const sync = () => {
      if (resume && !paused()) {
        const go = resume;
        resume = null;
        go();
      }
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    });
    if (rootRef.current) io.observe(rootRef.current);
    document.addEventListener("visibilitychange", sync);
    const wait = (ms: number) =>
      new Promise<void>((resolve) => (timer = setTimeout(resolve, ms))).then(() =>
        alive && paused() ? new Promise<void>((resolve) => (resume = resolve)) : undefined,
      );
    const L = text.length;
    (async () => {
      while (alive) {
        for (let i = 1; i <= L && alive; i++) {
          setN(i);
          await wait(65 + Math.random() * 55);
        }
        await wait(450);
        if (!alive) break;
        setHighlight(true);
        await wait(2600);
        if (!alive) break;
        setHighlight(false);
        await wait(750);
        for (let i = L - 1; i >= 0 && alive; i--) {
          setN(i);
          await wait(36);
        }
        await wait(700);
      }
    })();
    return () => {
      alive = false;
      clearTimeout(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      resume?.();
    };
  }, [text]);

  const space = text.indexOf(" ");
  const wordEnd = space < 0 ? text.length : space;
  const shown = text.slice(0, n);

  return (
    <span ref={rootRef} className="hn">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="hn-sizer">
        {text}
        <span className="hn-caret hn-caret-static" />
      </span>
      <span aria-hidden="true" className="hn-type">
        <span className="hn-word">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="hn-mark">
            <path
              d={ZIGZAG}
              pathLength={1}
              fill="none"
              style={{
                stroke: "color-mix(in srgb, var(--accent-b) 50%, transparent)",
                strokeWidth: 10,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeDasharray: 1,
                strokeDashoffset: highlight ? 0 : 1,
                transition: highlight
                  ? "stroke-dashoffset 1s cubic-bezier(.55,.1,.35,1)"
                  : "stroke-dashoffset .6s cubic-bezier(.5,0,.6,1)",
              }}
            />
          </svg>
          {shown.slice(0, wordEnd)}
        </span>
        {shown.slice(wordEnd)}
        <span className="hn-caret" />
      </span>
    </span>
  );
}
