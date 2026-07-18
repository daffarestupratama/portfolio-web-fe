"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article, ArticleLanguage } from "@/content/home";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { TerminalIcon } from "@/components/ui/icons";

interface ArticlesBrowserProps {
  articles: Article[];
}

const ALL = "__all__";
const LANGUAGE_ORDER: ArticleLanguage[] = ["en", "id", "de"];

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono mb-2 text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ink-faint)" }}>
      {children}
    </div>
  );
}

export function ArticlesBrowser({ articles }: ArticlesBrowserProps) {
  const [category, setCategory] = useState<string>(ALL);
  const [language, setLanguage] = useState<string>(ALL);
  const [tag, setTag] = useState<string | null>(null);

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
  // The list query already sorts by publishedDate desc, so the first few are the most recent.
  const recent = useMemo(() => articles.slice(0, 5), [articles]);

  const showLanguageFilter = languages.length > 1;

  const filtered = articles.filter(
    (a) =>
      (category === ALL || a.category === category) &&
      (language === ALL || a.language === language) &&
      (tag === null || a.tags.includes(tag)),
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="lg:order-2 lg:w-[290px] lg:shrink-0 lg:self-start lg:sticky lg:top-28">
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

          <div>
            <SidebarHeading>Recent</SidebarHeading>
            <ul className="flex flex-col gap-2">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="block text-[13px] transition-colors hover:text-(--accent-ink)"
                    style={{ lineHeight: 1.4, color: "var(--ink-dim)" }}
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/mkdir"
            className="glass-pill mono gap-2 px-3.5 py-2.5 text-[12.5px]"
            style={{ color: "var(--ink)" }}
          >
            <TerminalIcon style={{ color: "var(--accent-ink)" }} />
            Short notes? see /mkdir
          </Link>
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
