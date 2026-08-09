import Link from "next/link";
import type { Article } from "@/content/home";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { ArrowRightIcon } from "@/components/ui/icons";

interface WritingProps {
  articles: Article[];
}

export function Writing({ articles }: WritingProps) {
  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-5">
      <div className="w-full max-w-[1180px]">
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Articles
          </h2>
          <Link href="/articles" className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold">
            All articles
            <ArrowRightIcon />
          </Link>
        </div>

        {/* Same single-column list treatment as /articles, so the homepage section reads
            like a normal blog index rather than a card grid. */}
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
