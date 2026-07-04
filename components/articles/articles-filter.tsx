"use client";

import { useMemo, useState } from "react";
import type { Article, ArticleLanguage } from "@/content/home";
import { ArticleCard } from "@/components/cards/article-card";

interface ArticlesFilterProps {
  articles: Article[];
}

const ALL = "__all__";
const LANGUAGE_ORDER: ArticleLanguage[] = ["en", "id", "de"];

export function ArticlesFilter({ articles }: ArticlesFilterProps) {
  const languages = useMemo(() => {
    const present = new Set(articles.map((a) => a.language));
    return LANGUAGE_ORDER.filter((l) => present.has(l));
  }, [articles]);
  const [active, setActive] = useState<string>(ALL);

  // Only offer the language filter when more than one language is present
  // (article.language isn't queryable on the live schema yet — all map to "en").
  const showFilter = languages.length > 1;
  const visible = active === ALL ? articles : articles.filter((a) => a.language === active);

  return (
    <>
      {showFilter && (
        <div className="mb-7 flex flex-wrap gap-1.5" role="group" aria-label="Filter articles by language">
          {[ALL, ...languages].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActive(lang)}
              data-active={active === lang}
              aria-pressed={active === lang}
              className="tab-btn"
              style={{ fontSize: "12.5px", padding: "7px 15px" }}
            >
              {lang === ALL ? "All" : lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
