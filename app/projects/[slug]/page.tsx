import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectSlugs } from "@/content/projects";
import { getSiteSettings } from "@/content/site";
import { buildMetadata, mergeSeo } from "@/lib/seo";
import { titleCase } from "@/lib/mappers";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { CoverImage } from "@/components/ui/cover-image";
import { Gallery } from "@/components/ui/gallery";
import { NotebookResources } from "@/components/projects/notebook-resources";
import { ArticleCard } from "@/components/cards/article-card";
import { badgeStyle, projectTypeMeta } from "@/components/cards/project-type-meta";
import { ArrowRightIcon, DashboardIcon, ExternalLinkIcon, GithubIcon } from "@/components/ui/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return {};
  return buildMetadata(mergeSeo(project.seo, site.defaultSeo), { absoluteTitle: true });
}

const sectionHeading = "mt-10 mb-3 text-[22px] font-bold";
const headingStyle = { letterSpacing: "-0.02em" } as const;

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const type = projectTypeMeta(project.projectType);
  const links = [
    project.githubUrl && { label: "GitHub", url: project.githubUrl, Icon: GithubIcon },
    project.liveDemoUrl && { label: "Live demo", url: project.liveDemoUrl, Icon: ExternalLinkIcon },
    project.dashboardUrl && { label: "Dashboard", url: project.dashboardUrl, Icon: DashboardIcon },
  ].filter(Boolean) as { label: string; url: string; Icon: typeof GithubIcon }[];

  return (
    <main className="relative z-[3] mx-auto w-full max-w-[860px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Link
        href="/projects"
        className="mono inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-(--accent-ink)"
        style={{ color: "var(--ink-dim)" }}
      >
        <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
        All projects
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="badge" style={badgeStyle(type.hue)}>
          {type.label}
        </span>
        <span className="chip rounded-full px-2.5 py-1 text-[11.5px]">{titleCase(project.projectStatus)}</span>
        <span className="mono text-[12px]" style={{ color: "var(--ink-faint)" }}>
          {project.year}
        </span>
      </div>

      <h1 className="mt-3 font-bold" style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        {project.title}
      </h1>
      {project.summary && (
        <p className="mt-4 text-[16px]" style={{ lineHeight: 1.6, color: "var(--ink-dim)" }}>
          {project.summary}
        </p>
      )}

      <CoverImage
        image={project.coverImage}
        variant="project"
        label={`${project.title} cover`}
        className="mt-6 aspect-video w-full"
        sizes="(max-width: 900px) 100vw, 860px"
        priority
      />

      {project.techStack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-[7px]">
          {project.techStack.map((tech) => (
            <span key={tech} className="chip mono px-[9px] py-1 text-[11px]" style={{ borderRadius: 8 }}>
              {tech}
            </span>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {links.map(({ label, url, Icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-pill gap-2 px-4 py-2 text-[13px] font-semibold"
            >
              <Icon width={15} height={15} />
              {label}
            </a>
          ))}
        </div>
      )}

      {project.problem && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Problem
          </h2>
          <p className="text-[15.5px]" style={{ lineHeight: 1.75, color: "var(--ink)" }}>
            {project.problem}
          </p>
        </section>
      )}

      {project.approach && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Approach
          </h2>
          <StrapiBlocks content={project.approach} />
        </section>
      )}

      {project.result && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Result
          </h2>
          <StrapiBlocks content={project.result} />
        </section>
      )}

      {project.notebookResources.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Notebooks &amp; outputs
          </h2>
          <NotebookResources resources={project.notebookResources} />
        </section>
      )}

      {project.gallery.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Gallery
          </h2>
          <Gallery images={project.gallery} />
        </section>
      )}

      {project.relatedArticles.length > 0 && (
        <section>
          <h2 className={sectionHeading} style={headingStyle}>
            Related writing
          </h2>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            {project.relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
