"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/components/blocks/toc";

/** Distance below the viewport top (clearing the fixed nav) that counts as "being read". */
const READING_LINE = 120;

/**
 * Scroll-spy for a set of TOC headings, shared by the desktop sidebar and the
 * narrow-viewport dot rail so they stay in sync and only one listener runs.
 *
 * Resolves the active section as the LAST heading above the reading line rather than
 * whichever heading is currently crossing a band: with widely spaced headings there are
 * long stretches where no heading is in view at all, and a band-only approach leaves the
 * highlight stuck on a section the reader scrolled past minutes ago.
 */
export function useActiveHeading(entries: TocEntry[]): string | null {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      let current = headings[0]!.id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= READING_LINE) current = el.id;
        else break;
      }
      setActive(current);
    };
    // Always schedule through rAF — this both throttles scroll work and keeps setState
    // out of the effect body.
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
  }, [entries]);

  return active;
}
