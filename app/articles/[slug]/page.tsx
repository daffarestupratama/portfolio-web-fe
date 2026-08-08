import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getArticleSlugs } from "@/content/articles";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg, notFoundMetadata, SITE_NAME } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { extractToc } from "@/components/blocks/toc";
import { ArticleToc } from "@/components/articles/article-toc";
import { TocRail } from "@/components/articles/toc-rail";
import { getRelatedArticles } from "@/components/articles/related-articles";
import { CoverImage } from "@/components/ui/cover-image";
import { ProjectCard } from "@/components/cards/project-card";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [article, site] = await Promise.all([getArticleBySlug(slug), getSiteSettings()]);
  if (!article) return notFoundMetadata();
  return buildPageMetadata({
    path: `/articles/${slug}`,
    seo: article.seo,
    title: article.title,
    description: article.excerpt,
    image: mappedImageToOg(article.coverImage),
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
    ogType: "article",
    article: {
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: [site.siteName || SITE_NAME],
    },
  });
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getAllArticles();
  const related = getRelatedArticles(article, allArticles);
  const toc = extractToc(article.body);

  return (
    // Below lg the fixed TocRail occupies the left edge, so the content gets its own
    // gutter there — the rail sits in that space and never overlaps the text.
    <main className="relative z-[3] mx-auto w-full max-w-[1140px] px-[22px] pt-28 pb-16 max-lg:pl-[58px] sm:pt-32">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "" },
          { name: "Articles", path: "/articles" },
          { name: article.title, path: `/articles/${slug}` },
        ]}
      />
      <ArticleJsonLd
        headline={article.title}
        description={article.excerpt}
        imageUrl={article.coverImage?.url ?? null}
        datePublished={article.publishedTime}
        dateModified={article.modifiedTime}
        authorName={SITE_NAME}
        path={`/articles/${slug}`}
      />

      {/* Narrow viewports: the sidebar is replaced by a fixed dot rail on the left edge. */}
      <TocRail entries={toc} />

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Sidebar — FIRST in DOM so it sits to the LEFT of the content at lg, anchored
            while scrolling. Hidden below lg, where TocRail takes over and the related
            articles move to the bottom of the page. */}
        <aside className="hidden lg:block">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
            <ArticleToc entries={toc} />

            {related.length > 0 && (
              <section aria-label="Related articles">
                <div className="mono mb-2.5 text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--ink-faint)" }}>
                  Related articles
                </div>
                <ul className="flex flex-col gap-3">
                  {related.map((a) => (
                    <li key={a.id}>
                      <Link href={`/articles/${a.slug}`} className="group block">
                        <span
                          className="block text-[13.5px] font-semibold transition-colors group-hover:text-(--accent-ink)"
                          style={{ lineHeight: 1.35 }}
                        >
                          {a.title}
                        </span>
                        <span className="mono mt-0.5 block text-[11px]" style={{ color: "var(--ink-faint)" }}>
                          {a.category} · {a.publishedDate}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Link
              href="/articles"
              className="mono inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-(--accent-ink)"
              style={{ color: "var(--ink-dim)" }}
            >
              <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
              Back to all articles
            </Link>
          </div>
        </aside>

        {/* Article content */}
        <div className="min-w-0">
          <Link
            href="/articles"
            className="mono inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-(--accent-ink)"
            style={{ color: "var(--ink-dim)" }}
          >
            <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
            All articles
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span
              className="badge"
              style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
            >
              {article.category}
            </span>
            <span className="chip mono px-2 py-1 text-[10.5px] font-medium" style={{ borderRadius: 7 }}>
              {article.language.toUpperCase()}
            </span>
            <span className="mono text-[12px]" style={{ color: "var(--ink-faint)" }}>
              {article.publishedDate} · {article.readTime}
            </span>
          </div>

          <h1 className="mt-3 font-bold" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.12, letterSpacing: "-0.03em" }}>
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 text-[16px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
              {article.excerpt}
            </p>
          )}

          <CoverImage
            image={article.coverImage}
            variant="article"
            label={`${article.title} cover`}
            className="mt-6 aspect-[16/9] w-full"
            sizes="(max-width: 860px) 100vw, 820px"
            priority
          />

          {article.body && (
            <article className="mt-8">
              <StrapiBlocks content={article.body} headingIds={toc.map((t) => t.id)} />
            </article>
          )}

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-[7px]">
              {article.tags.map((tag) => (
                <span key={tag} className="chip mono px-[9px] py-1 text-[11px]" style={{ borderRadius: 8 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {article.relatedProjects.length > 0 && (
            <section>
              <h2 className="mt-10 mb-3 text-[22px] font-bold" style={{ letterSpacing: "-0.02em" }}>
                Related projects
              </h2>
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
                {article.relatedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </div>

      </div>

      {/* Narrow viewports only: related articles live at the very bottom, after the
          article content (the lg sidebar carries them otherwise). */}
      {related.length > 0 && (
        <section aria-label="Related articles" className="mt-12 lg:hidden">
          <h2 className="mb-4 text-[20px] font-bold" style={{ letterSpacing: "-0.02em" }}>
            Related articles
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((a) => (
              <li key={a.id} className="glass-card p-4" style={{ borderRadius: 16 }}>
                <Link href={`/articles/${a.slug}`} className="group relative z-[2] block">
                  <span
                    className="block text-[14px] font-semibold transition-colors group-hover:text-(--accent-ink)"
                    style={{ lineHeight: 1.35 }}
                  >
                    {a.title}
                  </span>
                  <span className="mono mt-1 block text-[11px]" style={{ color: "var(--ink-faint)" }}>
                    {a.category} · {a.publishedDate}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/articles"
            className="mono mt-5 inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-(--accent-ink)"
            style={{ color: "var(--ink-dim)" }}
          >
            <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
            Back to all articles
          </Link>
        </section>
      )}
    </main>
  );
}
