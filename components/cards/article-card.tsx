"use client";

import { useTilt } from "@/hooks/use-tilt";
import type { Article } from "@/content/home";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const ref = useTilt<HTMLDivElement>();

  return (
    <div ref={ref} data-tilt className="glass-card flex flex-col p-[14px]">
      <MediaPlaceholder
        variant="article"
        label={`${article.title} cover`}
        className="relative z-[2] aspect-[16/10] w-full"
      />

      <div className="relative z-[2] flex flex-1 flex-col px-1.5 pt-3.5 pb-1">
        <div className="flex items-center gap-[7px]">
          <span
            className="badge"
            style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
          >
            {article.category}
          </span>
          <span className="chip mono px-2 py-1 text-[10.5px] font-medium" style={{ borderRadius: 7 }}>
            {article.language.toUpperCase()}
          </span>
        </div>

        <h3 className="mt-3 text-[16.5px] font-semibold" style={{ lineHeight: 1.3, letterSpacing: "-0.02em" }}>
          {article.title}
        </h3>
        <p className="mt-[9px] flex-1 text-[13px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
          {article.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
          <span>{article.publishedDate}</span>
          <span>·</span>
          <span>{article.readTime}</span>
          <ArrowRightIcon className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
