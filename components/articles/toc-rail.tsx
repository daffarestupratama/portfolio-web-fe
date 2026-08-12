"use client";

import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";

/**
 * Narrow-viewport replacement for the sticky sidebar: a slim rail pinned to the LEFT
 * edge showing one dot per heading, with the current section's dot filled and enlarged.
 * Tapping (or keyboard-activating) the toggle expands the rail into a labelled TOC panel.
 *
 * Collapsed it is only a few px wide and offset from the text column, so it never
 * obscures the article. Hidden entirely at `lg`, where the real sidebar takes over.
 */
export function TocRail({ entries }: { entries: TocEntry[] }) {
  const [open, setOpen] = useState(false);
  const active = useActiveHeading(entries);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // While expanded the panel is a transient overlay sitting on top of the article, so it
  // has to dismiss the way one is expected to: a press anywhere else, or Escape. Both hand
  // focus back to the toggle, otherwise a keyboard user is left focused on a removed node
  // and their next Tab restarts from the top of the document.
  useEffect(() => {
    if (!open) return;
    // pointerdown, not click: dismiss should feel immediate and must fire even when the
    // press lands on something that swallows the click.
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      const hadFocusInside = !!rootRef.current?.contains(document.activeElement);
      setOpen(false);
      if (!hadFocusInside) return; // focus was elsewhere already — leave it alone
      toggleRef.current?.focus();
      // The browser's own mousedown focus handling runs *after* this listener and hands
      // focus to whatever was pressed, or clears it to <body> when that was dead space.
      // Reclaim it only in the latter case, so pressing a real control still wins.
      setTimeout(() => {
        if (document.activeElement === document.body) toggleRef.current?.focus();
      }, 0);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (entries.length === 0) return null;

  return (
    // Breakpoint hiding lives in the .toc-rail CSS rule, not a `lg:hidden` utility —
    // see the note in globals.css (source order made the utility a no-op here).
    <div ref={rootRef} className="toc-rail" data-open={open || undefined}>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="toc-rail-panel"
        aria-label={open ? "Collapse table of contents" : "Expand table of contents"}
        className="toc-rail-toggle mono"
      >
        {open ? "×" : "☰"}
      </button>

      {open ? (
        <nav id="toc-rail-panel" aria-label="Table of contents" className="toc-rail-panel">
          <ul className="flex flex-col gap-1">
            {entries.map((e) => {
              const isActive = active === e.id;
              return (
                <li key={e.id}>
                  <a
                    href={`#${e.id}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setOpen(false)}
                    className="block py-1 text-[12.5px] transition-colors"
                    style={{
                      paddingLeft: e.level === 3 ? 18 : 8,
                      borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                      color: isActive ? "var(--accent-ink)" : "var(--ink-dim)",
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.35,
                    }}
                  >
                    {e.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <ul id="toc-rail-panel" className="toc-rail-dots" aria-label="Article sections">
          {entries.map((e) => {
            const isActive = active === e.id;
            return (
              <li key={e.id}>
                <a
                  href={`#${e.id}`}
                  aria-label={e.text}
                  aria-current={isActive ? "true" : undefined}
                  className="toc-rail-dot"
                  data-active={isActive || undefined}
                  data-sub={e.level === 3 || undefined}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
