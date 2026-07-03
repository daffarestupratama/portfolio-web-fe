"use client";

import { useEffect, useRef } from "react";

/** Pointer-driven 3D tilt for `data-tilt` cards. No-ops under prefers-reduced-motion. */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const calm = el.closest('[data-motion="calm"]') !== null;
    const liftMag = calm ? 3 : 7;
    const rotMag = calm ? 2.2 : 5.5;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * rotMag).toFixed(2)}deg) rotateY(${(px * rotMag * 1.1).toFixed(2)}deg) translateY(${-liftMag}px)`;
    };
    const leave = () => {
      el.style.transform = "";
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return ref;
}
