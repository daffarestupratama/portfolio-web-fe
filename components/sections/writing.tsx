import Link from "next/link";
import type { Article } from "@/content/home";
import { ArticleCard } from "@/components/cards/article-card";
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
            Writing
          </h2>
          <Link href="/articles" className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold">
            All articles
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
