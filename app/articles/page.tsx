import type { Metadata } from "next";
import { getAllArticles } from "@/content/articles";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata } from "@/lib/seo";
import { ArticlesBrowser } from "@/components/articles/articles-browser";
import { PageHeader } from "@/components/ui/page-header";
import { PageTop } from "@/components/layout/page-top";

export const revalidate = 3600;

const ARTICLES_DESCRIPTION =
  "Notes and essays by Daffa Ilham Restupratama on data, technology, business, and career.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return buildPageMetadata({
    path: "/articles",
    title: "Articles",
    description: ARTICLES_DESCRIPTION,
    defaultSeo: site.defaultSeo,
  });
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
      <PageTop />
      <main>
        <PageHeader title="Articles" subtitle="Notes on data, technology, business, and the ideas I explore along the way." />
        <div className="pg-body">
          {articles.length === 0 ? (
            <p className="pg-empty">No articles published yet.</p>
          ) : (
            <ArticlesBrowser articles={articles} />
          )}
        </div>
      </main>
    </>
  );
}
