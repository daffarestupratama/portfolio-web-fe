"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { featuredFirst, type Article, type ArticleLanguage } from "@/content/home";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { CloseIcon } from "@/components/ui/icons";

interface ArticlesBrowserProps {
  articles: Article[];
}

const ALL = "__all__";
const LANGUAGE_ORDER: ArticleLanguage[] = ["en", "id", "de"];
const PANEL_ID = "articles-filter-panel";

/** 2a shows this many tags before "Show all {n} tags". */
const TAG_MAX = 10;

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return <div className="af-label mono">{children}</div>;
}

/** A chip summarising one active filter, with its own clear button, shown above the list on
 *  narrow viewports so the state stays visible while the panel is shut (not in 2a, kept). */
function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="af-active mono">
      {label}
      <button type="button" onClick={onClear} aria-label={`Clear filter: ${label}`}>
        <CloseIcon width={11} height={11} />
      </button>
    </span>
  );
}

export function ArticlesBrowser({ articles }: ArticlesBrowserProps) {
  const [category, setCategory] = useState<string>(ALL);
  const [language, setLanguage] = useState<string>(ALL);
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category))).sort(), [articles]);
  const languages = useMemo(() => {
    const present = new Set(articles.map((a) => a.language));
    return LANGUAGE_ORDER.filter((l) => present.has(l));
  }, [articles]);
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  }, [articles]);

  const showLanguageFilter = languages.length > 1;
  // 2a's tag cap, keeping an active tag visible even when it falls past the cap.
  let shownTags = allTags ? tags : tags.slice(0, TAG_MAX);
  if (tag !== null && !shownTags.includes(tag)) shownTags = [...shownTags, tag];

  // Featured first, applied AFTER filtering so a narrowed list still leads with whatever
  // featured articles survived the filter (rather than dropping the pinning entirely).
  const filtered = featuredFirst(
    articles.filter(
      (a) =>
        (category === ALL || a.category === category) &&
        (language === ALL || a.language === language) &&
        (tag === null || a.tags.includes(tag)),
    ),
  );

  const active: { label: string; clear: () => void }[] = [
    ...(category !== ALL ? [{ label: category, clear: () => setCategory(ALL) }] : []),
    ...(language !== ALL ? [{ label: language.toUpperCase(), clear: () => setLanguage(ALL) }] : []),
    ...(tag !== null ? [{ label: `#${tag}`, clear: () => setTag(null) }] : []),
  ];

  // Same dismissal contract as the article TOC rail: Escape or a press outside closes the
  // panel and hands focus back to the toggle, without stealing it from whatever was pressed.
  useEffect(() => {
    if (!open) return;
    const inside = (node: Node | null) =>
      Boolean(barRef.current?.contains(node) || panelRef.current?.contains(node));
    const onPointerDown = (e: PointerEvent) => {
      if (inside(e.target as Node)) return;
      const hadFocusInside = inside(document.activeElement);
      setOpen(false);
      if (!hadFocusInside) return;
      toggleRef.current?.focus();
      // The browser's own mousedown focus handling runs after this and gives focus to
      // whatever was pressed, or clears it to <body> for dead space. Reclaim it only then.
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

  const clearAll = () => {
    setCategory(ALL);
    setLanguage(ALL);
    setTag(null);
  };

  return (
    // Portfolio 2a: the list, and a sticky filter column on the right. From 1000px the column
    // is the always-open 290px panel; below it, a 48px column with a vertical button that
    // opens the same panel as an overlay. ONE instance of the controls either way.
    <div className="af">
      <div className="af-list">
        {active.length > 0 && (
          <div ref={barRef} className="af-actives">
            {active.map((f) => (
              <ActiveChip key={f.label} label={f.label} onClear={f.clear} />
            ))}
            {active.length > 1 && (
              <button type="button" onClick={clearAll} className="af-clear mono">
                Clear all
              </button>
            )}
          </div>
        )}
        {filtered.length === 0 ? (
          <p className="af-empty">No articles match these filters.</p>
        ) : (
          <div className="ar-list">
            {filtered.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      <div ref={panelRef} className="af-col">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          className="af-toggle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          <span className="af-toggle-label mono">Filter</span>
          {active.length > 0 && <span className="af-badge">{active.length}</span>}
        </button>

        <aside id={PANEL_ID} data-open={open || undefined} data-sb="toc" className="af-panel">
          <div className="af-panel-head">
            <span>Filter</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
              aria-label="Close filter"
              className="af-close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div>
            <SidebarHeading>Category</SidebarHeading>
            <div className="af-chips">
              {[ALL, ...categories].map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className="af-chip">
                  {c === ALL ? "All" : c}
                </button>
              ))}
            </div>
          </div>

          {showLanguageFilter && (
            <div>
              <SidebarHeading>Language</SidebarHeading>
              <div className="af-chips">
                {[ALL, ...languages].map((l) => (
                  <button key={l} type="button" onClick={() => setLanguage(l)} aria-pressed={language === l} className="af-chip">
                    {l === ALL ? "All" : l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <SidebarHeading>Tags</SidebarHeading>
              <div className="af-tags">
                {shownTags.map((t) => {
                  const isActive = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(isActive ? null : t)}
                      aria-pressed={isActive}
                      className="af-tag mono"
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
              {tags.length > TAG_MAX && (
                <button type="button" onClick={() => setAllTags((v) => !v)} className="af-more mono">
                  {allTags ? "Show fewer tags" : `Show all ${tags.length} tags`}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
