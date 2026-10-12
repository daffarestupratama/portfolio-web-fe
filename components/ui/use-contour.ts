"use client";

import { useEffect, useState } from "react";
import { contourMarkup } from "@/lib/contour";

/**
 * The seeded contour placeholder, drawn in the browser instead of on the server: the server
 * HTML carries no SVG (saving ~14 KB per card and the build CPU), only the placeholder's base
 * colour (see `contourBase`), so the card is never blank.
 *
 * After hydration the SVG is built when the main thread is idle (with a 200 ms deadline), so
 * it never competes with input or hydration work. The build itself is the same deterministic
 * `contourMarkup` as before, memoised per slug, so the output is byte-identical to what the
 * server used to send.
 */
export function useContour(seed: string, dark: boolean, enabled = true): string | null {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      performance.mark(`contour:start:${seed}`);
      const markup = contourMarkup(seed, dark);
      performance.mark(`contour:end:${seed}`);
      performance.measure(`contour:${seed}`, `contour:start:${seed}`, `contour:end:${seed}`);
      setSvg(markup);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(draw, { timeout: 200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = setTimeout(draw, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [seed, dark, enabled]);

  return svg;
}

/**
 * The colour of the contour's own background rect. The pre-draw layer is painted with it, so
 * when the SVG arrives only the rings appear on an identical backdrop: no flash, no shift.
 */
export function contourBase(dark: boolean): string {
  return dark ? "color-mix(in srgb, var(--accent) 20%, #14171C)" : "color-mix(in srgb, var(--accent) 7%, var(--bg))";
}
