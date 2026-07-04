import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleSlugs } from "@/content/articles";
import { getSiteSettings } from "@/content/site";
import { buildMetadata, mergeSeo } from "@/lib/seo";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { ProjectCard } from "@/components/cards/project-card";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [article, site] = await Promise.all([getArticleBySlug(slug), getSiteSettings()]);
  if (!article) return {};
  return buildMetadata(mergeSeo(article.seo, site.defaultSeo), { absoluteTitle: true });
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[820px] px-[22px] pt-28 pb-16 sm:pt-32">
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
          <StrapiBlocks content={article.body} />
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
    </main>
  );
}
