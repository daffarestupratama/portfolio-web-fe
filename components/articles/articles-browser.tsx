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

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono mb-2 text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ink-faint)" }}>
      {children}
    </div>
  );
}

/** A chip summarising one active filter, with its own clear button, shown in the narrow
 *  viewport filter bar so the state stays visible while the panel is shut. */
function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span
      className="chip mono inline-flex items-center gap-1 px-2.5 py-1 text-[11px]"
      style={{ borderRadius: 8, color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
    >
      {label}
      <button type="button" onClick={onClear} aria-label={`Clear filter: ${label}`} className="-mr-0.5 cursor-pointer">
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
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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

  return (
    // DOM order is filter bar → aside → list. The lg:order-* utilities put it back to
    // list-left / aside-right from `lg` up, so the desktop layout is unchanged; below `lg`
    // the visitor now gets the title, a single Filter button, then the articles — instead
    // of scrolling past every control to reach the first row.
    <div className="flex flex-col gap-8 lg:flex-row">
      <div ref={barRef} className="articles-filter-bar flex flex-wrap items-center gap-2">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          className="glass-pill gap-2 px-4 py-2 text-[13px] font-semibold"
        >
          Filter
          {active.length > 0 && (
            <span
              className="mono inline-flex h-[18px] min-w-[18px] items-center justify-center px-1 text-[10.5px]"
              style={{ borderRadius: 999, background: "var(--accent)", color: "var(--bg)" }}
            >
              {active.length}
            </span>
          )}
        </button>

        {active.map((f) => (
          <ActiveChip key={f.label} label={f.label} onClear={f.clear} />
        ))}

        {active.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setCategory(ALL);
              setLanguage(ALL);
              setTag(null);
            }}
            className="mono cursor-pointer text-[11.5px] underline underline-offset-2"
            style={{ color: "var(--ink-dim)" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ONE instance of the controls. Below `lg` this element is the collapsible panel;
          at `lg` it is the always-visible right column. Rendering a separate mobile copy
          would put a hidden duplicate of every control in the DOM.
          Visibility lives in globals.css, not `lg:` utilities — see the note there. */}
      <aside
        ref={panelRef}
        id={PANEL_ID}
        data-open={open || undefined}
        className="articles-filters lg:order-2 lg:w-[290px] lg:shrink-0 lg:self-start lg:sticky lg:top-28"
      >
        <div className="flex flex-col gap-6">
          <div>
            <SidebarHeading>Category</SidebarHeading>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory(ALL)}
                data-active={category === ALL}
                className="tab-btn"
                style={{ fontSize: "12px", padding: "6px 13px" }}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  data-active={category === c}
                  className="tab-btn"
                  style={{ fontSize: "12px", padding: "6px 13px" }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {showLanguageFilter && (
            <div>
              <SidebarHeading>Language</SidebarHeading>
              <div className="flex flex-wrap gap-1.5">
                {[ALL, ...languages].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    data-active={language === l}
                    className="tab-btn"
                    style={{ fontSize: "12px", padding: "6px 13px" }}
                  >
                    {l === ALL ? "All" : l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <SidebarHeading>Tags</SidebarHeading>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const isActive = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(isActive ? null : t)}
                      aria-pressed={isActive}
                      className="chip mono cursor-pointer px-2.5 py-1 text-[11px]"
                      style={{
                        borderRadius: 8,
                        ...(isActive
                          ? { color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }
                          : null),
                      }}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="lg:order-1 lg:flex-1">
        {filtered.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            No articles match these filters.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
