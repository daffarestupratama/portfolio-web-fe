"use client";

import { useEffect, useRef } from "react";
import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";
import { useReadingProgress } from "@/hooks/use-reading-progress";

/** Keeps the highlighted entry this far from the scroll container's edges. */
const KEEP_IN_VIEW_MARGIN = 24;

/** The id of the article body the reading progress is measured over. */
export const ARTICLE_BODY_ID = "art-body";

/**
 * Portfolio 2a's sidebar table of contents: a sticky strip with "On this page", the reading
 * percentage and a progress bar, then the entries beside an inset rail whose accent fill grows
 * to the current section. Entries already read are ink, the current one accent, the rest dim.
 * Scroll-spy (useActiveHeading) and the anchors are unchanged.
 */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveHeading(entries);
  const pct = useReadingProgress(ARTICLE_BODY_ID);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // If the sidebar has had to become internally scrollable (a TOC longer than the
  // viewport), the highlight can drift outside its visible band as the reader scrolls.
  // Nudge the container's own scrollTop to follow it — never scrollIntoView, which walks
  // up and scrolls the PAGE too, yanking the reader away from what they're reading.
  useEffect(() => {
    const link = activeRef.current;
    const box = link?.closest<HTMLElement>(".ad-aside");
    if (!link || !box || box.scrollHeight <= box.clientHeight) return;
    const linkRect = link.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    // The sticky progress strip covers the top of the box, so keep clear of it too.
    const head = box.querySelector<HTMLElement>(".toc-head")?.offsetHeight ?? 0;
    if (linkRect.top < boxRect.top + head + KEEP_IN_VIEW_MARGIN) {
      box.scrollTop -= boxRect.top + head + KEEP_IN_VIEW_MARGIN - linkRect.top;
    } else if (linkRect.bottom > boxRect.bottom - KEEP_IN_VIEW_MARGIN) {
      box.scrollTop += linkRect.bottom - (boxRect.bottom - KEEP_IN_VIEW_MARGIN);
    }
  }, [active]);

  if (entries.length === 0) return null;
  const activeIndex = entries.findIndex((e) => e.id === active);
  const fill = activeIndex < 0 ? 0 : ((activeIndex + 1) / entries.length) * 100;

  return (
    <nav aria-label="Table of contents" className="toc">
      <div className="toc-head">
        <div className="toc-head-row mono">
          <span>On this page</span>
          <span className="toc-pct">{pct}%</span>
        </div>
        <div className="toc-bar" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>
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
