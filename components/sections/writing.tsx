import type { Article } from "@/content/home";
import { ArticleListItem } from "@/components/articles/article-list-item";
import { SectionHeader } from "@/components/sections/section-header";

interface WritingProps {
  articles: Article[];
}

export function Writing({ articles }: WritingProps) {
  return (
    <section className="home-sec home-sec-articles">
      <div className="home-sec-inner">
        <SectionHeader title="Articles" href="/articles" linkLabel="All articles" />
        {/* Same row as /articles, as in 2a. */}
        <div className="ar-list">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
