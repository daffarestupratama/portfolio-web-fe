import type { Metadata } from "next";
import { getAllArticles } from "@/content/articles";
import { ArticlesFilter } from "@/components/articles/articles-filter";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Notes and essays by Daffa Ilham Restupratama on data, technology, career, and city stories.",
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[1180px] px-[22px] pt-28 pb-16 sm:pt-32">
      <header className="mb-8">
        <h1 className="font-bold" style={{ fontSize: "clamp(30px,4vw,46px)", letterSpacing: "-0.03em" }}>
          Articles
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          Notes on data, technology, career, and the small stories behind city walks.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No articles published yet.
        </p>
      ) : (
        <ArticlesFilter articles={articles} />
      )}
    </main>
  );
}
