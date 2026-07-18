import Link from "next/link";
import type { Article } from "@/content/home";
import { CoverImage } from "@/components/ui/cover-image";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ArticleListItemProps {
  article: Article;
}

/** Horizontal article row for the /articles list (distinct from the vertical
 *  ArticleCard used on the homepage + related sections). */
export function ArticleListItem({ article }: ArticleListItemProps) {
  const href = `/articles/${article.slug}`;
  return (
    <article className="glass-card flex gap-4 p-3.5 sm:gap-5 sm:p-4" style={{ borderRadius: 18 }}>
      <Link href={href} aria-label={article.title} className="relative z-[2] block w-[104px] shrink-0 sm:w-[150px]">
        <CoverImage
          image={article.coverImage}
          variant="article"
          label={`${article.title} cover`}
          className="aspect-[4/3] w-full"
          sizes="150px"
        />
      </Link>

      <div className="relative z-[2] flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
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

        <h3 className="mt-2 text-[16.5px] font-semibold" style={{ lineHeight: 1.3, letterSpacing: "-0.02em" }}>
          <Link href={href} className="transition-colors hover:text-(--accent-ink)">
            {article.title}
          </Link>
        </h3>

        <p
          className="mt-1.5 line-clamp-2 text-[13px] sm:line-clamp-3"
          style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}
        >
          {article.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-3 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
          <span>{article.publishedDate}</span>
          <span>·</span>
          <span>{article.readTime}</span>
          <Link
            href={href}
            className="mono ml-auto inline-flex items-center gap-1 font-medium transition-colors hover:text-(--accent-ink)"
            style={{ color: "var(--ink-dim)" }}
          >
            Read
            <ArrowRightIcon width={13} height={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
