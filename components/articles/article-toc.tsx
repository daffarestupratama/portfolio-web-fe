"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/components/blocks/toc";

/** Table of contents with scroll-spy. Highlights the heading currently in view via
 *  IntersectionObserver; anchor links jump to each section (keyboard accessible). */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (obsEntries) => {
        const visible = obsEntries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Trigger when a heading enters the top ~30% band (below the fixed nav).
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

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
