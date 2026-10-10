"use client";

import { useEffect, useState } from "react";
import { HEADING_SCROLL_OFFSET } from "@/components/blocks/toc";

/**
 * Reading progress through an element, 0–100, as 2a's article TOC shows it: 0 while the
 * element's top is still below the reading line, 100 once its bottom reaches the bottom of the
 * viewport. The reading line is the same one the scroll-spy uses (HEADING_SCROLL_OFFSET + 1),
 * so the percentage and the highlighted heading move together. Updates are rAF-throttled.
 */
export function useReadingProgress(elementId: string): number {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const line = HEADING_SCROLL_OFFSET + 1;
    let frame = 0;
    const compute = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const start = r.top + window.scrollY - line;
      const end = r.bottom + window.scrollY - window.innerHeight;
      const next =
        end <= start ? 100 : Math.round(Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))) * 100);
      setPct(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [elementId]);

  return pct;
}
