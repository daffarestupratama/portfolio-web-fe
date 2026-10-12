"use client";

import { useEffect, useRef } from "react";
import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";

/** The id of the article body the rail's reading progress is measured over. */
export const ARTICLE_BODY_ID = "art-body";

/** Latest 2a's glide for the sidebar: 380ms, ease-out cubic. */
const GLIDE_MS = 380;

/**
 * Portfolio 2a's sidebar table of contents (latest export): an "On this page" label, then the
 * entries beside an inset rail whose accent fill grows to the current section. Entries already
 * read are ink, the current one accent, the rest dim. Scroll-spy (useActiveHeading) and the
 * anchors are unchanged.
 */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveHeading(entries);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const glide = useRef(0);

  // On a long article the sidebar scrolls internally (its scrollbar hidden). As the active
  // heading changes, glide the box so the active entry sits in its centre, as latest 2a does.
  // Only the box's own scrollTop moves, never the page; reduced motion jumps instead.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const link = activeRef.current;
      const box = link?.closest<HTMLElement>(".art-aside");
      if (!link || !box || box.scrollHeight <= box.clientHeight + 1) return;
      const lr = link.getBoundingClientRect();
      const br = box.getBoundingClientRect();
      const max = box.scrollHeight - box.clientHeight;
      const to = Math.max(0, Math.min(max, box.scrollTop + (lr.top + lr.height / 2) - (br.top + br.height / 2)));
      cancelAnimationFrame(glide.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        box.scrollTop = to;
        return;
      }
      const from = box.scrollTop;
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / GLIDE_MS);
        box.scrollTop = from + (to - from) * (1 - Math.pow(1 - k, 3));
        if (k < 1) glide.current = requestAnimationFrame(step);
      };
      glide.current = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => () => cancelAnimationFrame(glide.current), []);

  if (entries.length === 0) return null;
  const activeIndex = entries.findIndex((e) => e.id === active);
  const fill = activeIndex < 0 ? 0 : ((activeIndex + 1) / entries.length) * 100;

  return (
    <nav aria-label="Table of contents" className="toc">
      <div className="toc-label mono">On this page</div>
      <div className="toc-list">
        <span aria-hidden="true" className="toc-track" />
        <span aria-hidden="true" className="toc-fill" style={{ height: `${fill}%` }} />
        <ul>
          {entries.map((e, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={e.id}>
                <a
                  ref={isActive ? activeRef : undefined}
                  href={`#${e.id}`}
                  data-toc={e.id}
                  aria-current={isActive ? "true" : undefined}
                  data-state={isActive ? "on" : i < activeIndex ? "past" : undefined}
                  data-sub={e.level === 3 || undefined}
                  className="toc-a"
                >
                  {e.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
