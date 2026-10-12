"use client";

import { contourBase, useContour } from "@/components/ui/use-contour";

interface ContourProps {
  /** The slug; the same seed always draws the same terrain. */
  seed: string;
  /** 2a's dark variant (project tiles, fixed #14171C base) or the light one (article thumbs). */
  dark: boolean;
  className?: string;
}

/** A positioned layer that shows the contour's base colour immediately and fills in the
 *  seeded contour SVG once the browser is idle after hydration (see useContour). */
export function Contour({ seed, dark, className }: ContourProps) {
  const svg = useContour(seed, dark);
  return (
    <span
      aria-hidden="true"
      className={className}
      data-contour={seed}
      data-drawn={svg ? "" : undefined}
      style={{ background: contourBase(dark) }}
      {...(svg ? { dangerouslySetInnerHTML: { __html: svg } } : {})}
    />
  );
}
