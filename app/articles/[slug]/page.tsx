import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getArticleSlugs } from "@/content/articles";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg, notFoundMetadata, SITE_NAME } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { withHeadingIds } from "@/components/blocks/toc";
import { ArticleToc, ARTICLE_BODY_ID } from "@/components/articles/article-toc";
import { TocRail } from "@/components/articles/toc-rail";
import { BackToTop } from "@/components/articles/back-to-top";
import { getRelatedArticles } from "@/components/articles/related-articles";
import { StrapiImage } from "@/components/ui/strapi-image";
import { Contour } from "@/components/ui/contour";
import { RelatedCard } from "@/components/cards/related-card";
import { projectTypeMeta } from "@/components/cards/project-type-meta";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 3600;

/** Byline stand-in when no avatar is set, or when the image fails to load (2a's accent disc). */
function AuthorMonogram() {
  return <span className="ad-monogram">D</span>;
}

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
  // Deduped with the identical call in generateMetadata above by React cache(), so this
  // adds no Strapi request — measured, see the byline note below.
  const site = await getSiteSettings();
  const related = getRelatedArticles(article, allArticles);
  // One pass builds the TOC and stamps the matching ids onto the body's headings, so the
  // anchors and the links come from the same walk by construction.
  const { content: bodyWithIds, toc } = withHeadingIds(article.body);

  // Most articles have no headings at all (4 of 5 at the time of writing), which would leave
  // the sidebar empty. When there is no TOC to put there, the related content moves INTO the
  // sidebar instead of its usual place below the body, so the sidebar is never empty at
  // desktop width and neither block is ever rendered twice. 2a's own rule is the same
  // (tocAside / relAside / relBelow).
  const hasToc = toc.length > 0;
  const hasRelated = article.relatedProjects.length > 0 || related.length > 0;
  const relatedInSidebar = !hasToc && hasRelated;
  const hasSidebar = hasToc || relatedInSidebar;
  const size = relatedInSidebar ? "aside" : "below";

  // Related projects first, then related articles, then the way back: one block, rendered in
  // exactly ONE place (the sidebar or below the body).
  const relatedBlocks = hasRelated ? (
    <>
      {article.relatedProjects.length > 0 && (
        <section aria-label="Related projects" className="ad-rel">
          <h2 className="ad-rel-title">Related projects</h2>
          <div className="ad-rel-grid">
            {article.relatedProjects.map((p) => (
              <RelatedCard
                key={p.id}
                href={`/projects/${p.slug}`}
                title={p.title}
                meta={`${projectTypeMeta(p.projectType).label} · ${p.year}`}
                size={size}
              />
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section aria-label="Related articles" className="ad-rel">
          <h2 className="ad-rel-title">Related articles</h2>
          <div className="ad-rel-grid">
            {related.map((a) => (
              <RelatedCard
                key={a.id}
                href={`/articles/${a.slug}`}
                title={a.title}
                meta={`${a.category} · ${a.publishedDate}`}
                size={size}
              />
            ))}
          </div>
        </section>
      )}
      <Link href="/articles" className="ad-back-all mono">
        <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
        Back to all articles
      </Link>
    </>
  ) : null;

  return (
    // 2a widens the page only when there is a sidebar or related content, and pads the left
    // edge (50px) only when the fixed TOC rail renders below 1024px.
    <main className="ad nm-root" data-wide={hasToc || hasRelated || undefined} data-rail={hasToc || undefined}>
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

      {/* Narrow viewports: the TOC sidebar is replaced by the fixed rail on the left edge. */}
      <TocRail entries={toc} />

      <div className="ad-grid" data-aside={hasSidebar || undefined}>
        {/* The aside is sticky at --sticky-top and scrolls internally (scrollbar hidden,
            as in the latest 2a) when the TOC is taller than the viewport. `self-start` and `sticky`
            live on the same element, or sticky has nothing to stick within. With a TOC it is
            hidden below 1024px, where the rail takes over; carrying the related content it
            stays at every width and sits after the body when stacked. */}
        {hasSidebar && (
          <aside className="ad-aside" data-kind={hasToc ? "toc" : "related"} data-sb="toc">
            {hasToc ? <ArticleToc entries={toc} /> : relatedBlocks}
          </aside>
        )}

        <div className="ad-content">
          <Link href="/articles" className="nm-back mono">
            <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
            All articles
          </Link>

          {/* 2a's header: title, cover well, standfirst, byline, closed off by a rule. */}
          <header className="ad-head">
            <h1 className="ad-title">{article.title}</h1>
            <div className="ad-cover-well">
              <div className="ad-cover">
                {article.coverImage ? (
                  <StrapiImage
                    src={article.coverImage.url}
                    alt={article.coverImage.alt || `${article.title} cover`}
                    fill
                    sizes="(max-width: 860px) 100vw, 820px"
                    style={{ objectFit: "cover" }}
                    priority
                    fallback={<Contour seed={article.slug} dark={false} className="ad-contour" />}
                  />
                ) : (
                  <Contour seed={article.slug} dark={false} className="ad-contour" />
                )}
              </div>
            </div>

            {article.excerpt && <p className="ad-excerpt">{article.excerpt}</p>}

            <div className="ad-byline">
              <span className="ad-author">
                {/* The real photo from site-setting.authorAvatar — free, because
                    generateMetadata above already loads site-setting and React cache()
                    dedupes the two calls into one request. The monogram stays as the
                    fallback: StrapiImage swaps to it on load error as well as when the
                    field is empty. aria-hidden because the author's name sits beside it. */}
                <span aria-hidden="true" className="ad-avatar">
                  <span className="ad-avatar-in">
                    {site.authorAvatar ? (
                      <StrapiImage
                        src={site.authorAvatar.url}
                        alt=""
                        // Declared at the rendered size so next/image cannot warn about a
                        // modified dimension, and the box is reserved (no layout shift).
                        width={26}
                        height={26}
                        style={{ borderRadius: 999, objectFit: "cover", width: "100%", height: "100%" }}
                        fallback={<AuthorMonogram />}
                      />
                    ) : (
                      <AuthorMonogram />
                    )}
                  </span>
                </span>
                {/* SITE_NAME is the same constant ArticleJsonLd receives as authorName, so
                    the visible byline and the structured data cannot drift apart. */}
                <Link href="/about" className="ad-name">
                  {SITE_NAME}
                </Link>
              </span>
              <span aria-hidden="true" className="ad-sep">
                ·
              </span>
              <span className="ad-date mono">
                {article.publishedDate} · {article.readTime}
              </span>
              <span className="ad-pills">
                <span className="ad-cat">{article.category}</span>
                <span className="ad-lang mono">{article.language.toUpperCase()}</span>
              </span>
            </div>
          </header>

          {article.body && (
            <article id={ARTICLE_BODY_ID} className="ad-body">
              <StrapiBlocks content={bodyWithIds} variant="article" />
            </article>
          )}

          {article.tags.length > 0 && (
            <div className="ad-tags">
              {article.tags.map((tag) => (
                <span key={tag} className="ad-tag mono">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* After the body: the point at which someone has finished reading. Suppressed when
          the sidebar carries it. */}
      {!relatedInSidebar && relatedBlocks && <div className="ad-below">{relatedBlocks}</div>}

      <BackToTop />
    </main>
  );
}
