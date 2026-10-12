"use client";

import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "@/components/blocks/toc";
import { useActiveHeading } from "@/hooks/use-active-heading";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { ARTICLE_BODY_ID } from "@/components/articles/article-toc";

/**
 * Narrow-viewport replacement for the sticky sidebar (below 1024px): Portfolio 2a's rail,
 * fixed at left 8px / top 104px. Collapsed it is a toggle over an inset column of dots (the
 * current section large and accent, read sections accent, the rest faint). Expanded it is a
 * panel with "On this page", the reading percentage and every entry.
 */
export function TocRail({ entries }: { entries: TocEntry[] }) {
  const [open, setOpen] = useState(false);
  const active = useActiveHeading(entries);
  const pct = useReadingProgress(ARTICLE_BODY_ID);
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
  const activeIndex = entries.findIndex((e) => e.id === active);
  const state = (i: number) => (i === activeIndex ? "on" : i < activeIndex ? "past" : undefined);

  return (
    // Hidden from 1024px by the .rail rule in globals.css, where the sidebar takes over.
    <div ref={rootRef} className="rail" data-open={open || undefined}>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="toc-rail-panel"
        aria-label={open ? "Collapse table of contents" : "Expand table of contents"}
        className="rail-toggle mono"
      >
        {open ? "×" : "☰"}
      </button>

      {open ? (
        <nav id="toc-rail-panel" aria-label="Table of contents" data-sb="toc" className="rail-panel">
          <div className="toc-head-row mono">
            <span>On this page</span>
            <span className="toc-pct">{pct}%</span>
          </div>
          <ul>
            {entries.map((e, i) => (
              <li key={e.id}>
                <a
                  href={`#${e.id}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  data-state={state(i)}
                  data-sub={e.level === 3 || undefined}
                  className="rail-a"
                >
                  {e.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <ul id="toc-rail-panel" className="rail-dots" aria-label="Article sections">
          {entries.map((e, i) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                aria-label={e.text}
                aria-current={i === activeIndex ? "true" : undefined}
                data-state={state(i)}
                data-sub={e.level === 3 || undefined}
                className="rail-dot"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
