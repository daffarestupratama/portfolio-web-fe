import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectSlugs } from "@/content/projects";
import { getSiteSettings } from "@/content/site";
import { buildPageMetadata, mappedImageToOg, notFoundMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { titleCase } from "@/lib/mappers";
import { StrapiBlocks } from "@/components/blocks/strapi-blocks";
import { StrapiImage } from "@/components/ui/strapi-image";
import { Contour } from "@/components/ui/contour";
import { TechTile } from "@/components/ui/tech-tile";
import { Gallery } from "@/components/ui/gallery";
import { NotebookResources } from "@/components/projects/notebook-resources";
import { RelatedCard } from "@/components/cards/related-card";
import { projectTypeMeta } from "@/components/cards/project-type-meta";
import { ArrowRightIcon } from "@/components/ui/icons";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return notFoundMetadata();
  return buildPageMetadata({
    path: `/projects/${slug}`,
    seo: project.seo,
    title: project.title,
    description: project.summary,
    image: mappedImageToOg(project.coverImage),
    defaultSeo: site.defaultSeo,
    absoluteTitle: true,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const type = projectTypeMeta(project.projectType);
  const links = [
    project.githubUrl && { label: "GitHub", url: project.githubUrl },
    project.liveDemoUrl && { label: "Live demo", url: project.liveDemoUrl },
    project.dashboardUrl && { label: "Dashboard", url: project.dashboardUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  // 2a: logo tiles for technologies that have a logo, mono pills for the rest; the legacy
  // techStack strings stand in when an entry has no linked technologies yet.
  const logoTech = project.technologies.filter((t) => t.logo);
  const textTech =
    project.technologies.length > 0
      ? project.technologies.filter((t) => !t.logo).map((t) => t.name)
      : project.techStack;
  const hasTech = logoTech.length > 0 || textTech.length > 0;
  const galleryCount = `${project.gallery.length} ${project.gallery.length === 1 ? "image" : "images"}`;

  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${slug}` },
        ]}
      />

      <header className="pj-head">
        <Link href="/projects" className="nm-back mono">
          <ArrowRightIcon width={13} height={13} style={{ transform: "rotate(180deg)" }} />
          All projects
        </Link>
        <div className="pj-badges">
          <span className="pj-type">{type.label}</span>
          <span className="pj-status">{titleCase(project.projectStatus)}</span>
          <span className="pj-year mono">{project.year}</span>
        </div>
        <h1 className="pj-title">{project.title}</h1>
        {project.summary && <p className="pj-summary">{project.summary}</p>}
      </header>

      <section className="pj-body">
        <div className="pj-cover-well">
          <div className="pj-cover">
            {project.coverImage ? (
              <StrapiImage
                src={project.coverImage.url}
                alt={project.coverImage.alt || `${project.title} cover`}
                fill
                sizes="(max-width: 908px) 100vw, 860px"
                style={{ objectFit: "cover" }}
                priority
                fallback={<Contour seed={project.slug} dark className="pj-contour" />}
              />
            ) : (
              <Contour seed={project.slug} dark className="pj-contour" />
            )}
          </div>
        </div>

        {(hasTech || links.length > 0) && (
          <div className="pj-meta">
            {hasTech && (
              <div>
                <div className="pj-label mono">Technologies</div>
                {logoTech.length > 0 && (
                  <div className="pj-logos">
                    {logoTech.map((t) => (
                      <TechTile key={t.id} item={t} variant="tile46" />
                    ))}
                  </div>
                )}
                {textTech.length > 0 && (
                  <div className="pj-chips">
                    {textTech.map((name) => (
                      <span key={name} className="pj-chip mono">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {links.length > 0 && (
              <div className="pj-links">
                {links.map(({ label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="pj-link">
                    {label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pj-sections">
          {project.problem && (
            <section>
              <h2 className="pj-h2">Problem</h2>
              <p className="pj-text">{project.problem}</p>
            </section>
          )}

          {project.approach && (
            <section>
              <h2 className="pj-h2">Approach</h2>
              <StrapiBlocks content={project.approach} variant="project" />
            </section>
          )}

          {project.result && (
            <section>
              <h2 className="pj-h2">Result</h2>
              <div className="pj-result">
                <StrapiBlocks content={project.result} variant="project" />
              </div>
            </section>
          )}

          {project.notebookResources.length > 0 && (
            <section>
              <h2 className="pj-h2 pj-h2-lg">Notebooks &amp; outputs</h2>
              <NotebookResources resources={project.notebookResources} />
            </section>
          )}

          {project.gallery.length > 0 && (
            <section aria-label="Gallery">
              <div className="pj-gal-head">
                <h2 className="pj-h2 pj-h2-flush">Gallery</h2>
                <span className="pj-gal-count mono">{galleryCount}</span>
              </div>
              <Gallery images={project.gallery} variant="masonry" />
            </section>
          )}

          {project.relatedArticles.length > 0 && (
            <section>
              <h2 className="pj-h2 pj-h2-lg">Related writing</h2>
              <div className="pj-related">
                {project.relatedArticles.map((article) => (
                  <RelatedCard
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    title={article.title}
                    chip={article.category}
                    meta={`${article.publishedDate} · ${article.readTime}`}
                    size="writing"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
