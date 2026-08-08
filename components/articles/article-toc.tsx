"use client";

import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";

/** Table of contents with scroll-spy. Highlights the heading currently in view;
 *  anchor links jump to each section (keyboard accessible). */
export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveHeading(entries);

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
