import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getArticleSlugs } from "@/content/articles";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg, notFoundMetadata, SITE_NAME } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { withHeadingIds } from "@/components/blocks/toc";
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
  // One pass builds the TOC and stamps the matching ids onto the body's headings, so the
  // anchors and the links come from the same walk by construction.
  const { content: bodyWithIds, toc } = withHeadingIds(article.body);

  // Most articles have no headings at all (4 of 5 at the time of writing), which left the
  // sidebar rendering as an empty 260px column that shoved the body off-centre. When there
  // is no TOC to put there, the related content moves INTO the sidebar to fill it — and out
  // of its usual place below the body, so neither block is ever rendered twice.
  const hasToc = toc.length > 0;
  const hasRelated = article.relatedProjects.length > 0 || related.length > 0;
  const relatedInSidebar = !hasToc && hasRelated;
  const hasSidebar = hasToc || relatedInSidebar;

  // Built once each and rendered in exactly ONE place — either the sidebar or the usual
  // spot below the body — so there is structurally no duplicate to CSS-hide.
  const relatedProjectsBlock =
    article.relatedProjects.length > 0 ? (
      <section aria-label="Related projects">
        <h2
          className={`mb-3 font-bold ${relatedInSidebar ? "text-[20px]" : "mt-10 text-[22px]"}`}
          style={{ letterSpacing: "-0.02em" }}
        >
          Related projects
        </h2>
        {/* One column in the narrow sidebar; outside a .bento grid ProjectCard keeps its
            16/10 ratio, so it becomes a compact ~260×162 cover tile there. */}
        <div className={`grid grid-cols-1 gap-[18px] sm:grid-cols-2 ${relatedInSidebar ? "lg:grid-cols-1" : ""}`}>
          {article.relatedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    ) : null;

  const relatedArticlesBlock =
    related.length > 0 ? (
      <section aria-label="Related articles" className={relatedInSidebar ? undefined : "mt-12"}>
        <h2 className="mb-4 text-[20px] font-bold" style={{ letterSpacing: "-0.02em" }}>
          Related articles
        </h2>
        <ul className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${relatedInSidebar ? "lg:grid-cols-1" : "lg:grid-cols-4"}`}>
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
    ) : null;

  return (
    // The left gutter exists only to clear the fixed TocRail, so it is applied only when
    // that rail actually renders. 44px puts the text ~22px from the dots' right edge,
    // matching the right margin, while still clearing the wider toggle box by 12px.
    <main
      className={`relative z-[3] mx-auto w-full max-w-[1140px] px-[22px] pt-28 pb-16 sm:pt-32 ${
        hasToc ? "max-lg:pl-[44px]" : ""
      }`}
    >
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

      {/* Flex below lg so the aside can be ordered AFTER the content when it carries the
          related blocks; grid from lg up, where `lg:order-first` puts it back in column 1.
          With no sidebar at all the wrapper stays a plain block so the body centres. */}
      <div
        className={
          hasSidebar ? "flex flex-col gap-12 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12" : undefined
        }
      >
        {/* Sidebar — anchored while scrolling. With a TOC it is hidden below lg, where
            TocRail takes over; carrying the related blocks instead it stays visible at every
            width, sitting below the body when stacked. */}
        {/* `self-start` + `sticky` must be on the SAME element. A grid item stretches to
            the row height by default, so sticky has nothing to stick within; but putting
            self-start on the aside and sticky on its child is equally broken — the child
            then sticks inside a box that is only as tall as itself. */}
        {/* `.article-aside` caps the pinned column's height and lets it scroll internally
            — see globals.css. Load-bearing for the 31-entry TOC on the Odoo article. */}
        {hasSidebar && (
          <aside
            className={`article-aside self-start lg:sticky lg:top-28 ${
              relatedInSidebar ? "order-last flex flex-col gap-8 lg:order-first" : "hidden lg:block"
            }`}
          >
            {hasToc ? (
              <ArticleToc entries={toc} />
            ) : (
              <>
                {relatedProjectsBlock}
                {relatedArticlesBlock}
              </>
            )}
          </aside>
        )}

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

          {/* One coherent header block: cover → title → standfirst → byline, closed off by
              a rule. Without the divider the metadata ran straight into the prose and the
              page read as one undifferentiated column. */}
          <header className="mb-8 border-b pb-6" style={{ borderColor: "var(--border)" }}>
            <CoverImage
              image={article.coverImage}
              variant="article"
              label={`${article.title} cover`}
              className="mt-5 aspect-[16/9] w-full"
              sizes="(max-width: 860px) 100vw, 820px"
              priority
            />

            <h1
              className="mt-6 font-bold"
              style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.12, letterSpacing: "-0.03em" }}
            >
              {article.title}
            </h1>

            {/* Standfirst: sits with the title rather than the body, so the header reads as
                one unit and the divider lands after the metadata. */}
            {article.excerpt && (
              <p className="mt-4 text-[16px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
                {article.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <span className="flex items-center gap-2">
                {/* Monogram rather than the about-page photo: that would add a third Strapi
                    fetch to every article render and couple this page to another endpoint's
                    availability, for a 26px decoration. */}
                <span
                  aria-hidden="true"
                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center text-[12px] font-bold"
                  style={{
                    borderRadius: 999,
                    background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    color: "#fff",
                  }}
                >
                  D
                </span>
                {/* SITE_NAME is the same constant ArticleJsonLd receives as authorName, so
                    the visible byline and the structured data cannot drift apart. */}
                <Link
                  href="/about"
                  className="text-[13.5px] font-semibold underline-offset-4 transition-colors hover:text-(--accent-ink) hover:underline"
                >
                  {SITE_NAME}
                </Link>
              </span>

              <span aria-hidden="true" style={{ color: "var(--ink-faint)" }}>
                ·
              </span>
              <span className="mono text-[12px]" style={{ color: "var(--ink-faint)" }}>
                {article.publishedDate} · {article.readTime}
              </span>

              <span className="ml-auto flex flex-wrap items-center gap-2">
                <span
                  className="badge"
                  style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
                >
                  {article.category}
                </span>
                <span className="chip mono px-2 py-1 text-[10.5px] font-medium" style={{ borderRadius: 7 }}>
                  {article.language.toUpperCase()}
                </span>
              </span>
            </div>
          </header>

          {article.body && (
            <article>
              <StrapiBlocks content={bodyWithIds} />
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

          {!relatedInSidebar && relatedProjectsBlock}
        </div>

      </div>

      {/* Full width, outside the grid, after the body and after Related projects — the point
          at which someone has finished reading. Suppressed when the sidebar carries it. */}
      {!relatedInSidebar && relatedArticlesBlock}
    </main>
  );
}
