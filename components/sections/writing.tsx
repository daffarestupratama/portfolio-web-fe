import type { Article } from "@/content/home";
import { ArticleCard } from "@/components/cards/article-card";

interface WritingProps {
  articles: Article[];
}

export function Writing({ articles }: WritingProps) {
  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[46px] pb-5">
      <div className="w-full max-w-[1180px]">
        <div className="mb-[22px]">
          <div className="mono text-xs tracking-[0.14em] uppercase" style={{ color: "var(--accent-ink)" }}>
            04 — Notes
          </div>
          <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Writing
          </h2>
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
