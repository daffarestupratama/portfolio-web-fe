"use client";

import { useEffect, useRef } from "react";
import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";

/** Keeps the highlighted entry this far from the scroll container's edges. */
const KEEP_IN_VIEW_MARGIN = 24;

/** Table of contents with scroll-spy. Highlights the heading currently in view;
 *  anchor links jump to each section (keyboard accessible). */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveHeading(entries);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // If the sidebar has had to become internally scrollable (a TOC longer than the
  // viewport), the highlight can drift outside its visible band as the reader scrolls.
  // Nudge the container's own scrollTop to follow it — never scrollIntoView, which walks
  // up and scrolls the PAGE too, yanking the reader away from what they're reading.
  useEffect(() => {
    const link = activeRef.current;
    const box = link?.closest<HTMLElement>(".article-aside");
    if (!link || !box || box.scrollHeight <= box.clientHeight) return;
    const linkRect = link.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    if (linkRect.top < boxRect.top + KEEP_IN_VIEW_MARGIN) {
      box.scrollTop -= boxRect.top + KEEP_IN_VIEW_MARGIN - linkRect.top;
    } else if (linkRect.bottom > boxRect.bottom - KEEP_IN_VIEW_MARGIN) {
      box.scrollTop += linkRect.bottom - (boxRect.bottom - KEEP_IN_VIEW_MARGIN);
    }
  }, [active]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <div className="mono mb-2.5 text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ink-faint)" }}>
        On this page
      </div>
      <ul className="flex flex-col gap-1.5" style={{ borderLeft: "1px solid var(--border)" }}>
        {entries.map((e) => {
          const isActive = active === e.id;
          return (
            <li key={e.id} style={{ marginLeft: -1 }}>
              <a
                ref={isActive ? activeRef : undefined}
                href={`#${e.id}`}
                aria-current={isActive ? "true" : undefined}
                className="block py-0.5 text-[13px] transition-colors"
                style={{
                  paddingLeft: e.level === 3 ? 22 : 12,
                  borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                  color: isActive ? "var(--accent-ink)" : "var(--ink-dim)",
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1.4,
                }}
              >
                {e.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
