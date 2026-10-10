"use client";

import Link from "next/link";
import type { Project } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";
import { bentoRows, type BentoLayout } from "@/components/cards/bento";
import { projectTypeMeta } from "@/components/cards/project-type-meta";
import { Contour } from "@/components/ui/contour";
import { TechTile } from "@/components/ui/tech-tile";

interface ProjectCardProps {
  project: Project;
  /** Position in the grid — drives the tile's row span in `layout`. */
  index?: number;
  layout?: BentoLayout;
}

/** 2a shows at most this many technologies on a tile. */
const MAX_SKILLS = 6;

/**
 * Portfolio 2a's project tile: a raised frame holding the cover (or a seeded contour map when
 * there is none), a dark bottom scrim, and the type, year, title, technologies and
 * "Details →". Hovering, or focusing the link, reveals the summary; on single-row tiles the
 * type and technology rows fold away to make room, as 2a's `hideRest` does. All of it is CSS
 * (`.pc*` in globals.css), so nothing re-renders on hover.
 *
 * The whole tile is one link: the title's stretched `::after` covers the card, so a pointer
 * click anywhere navigates. The technology logos are the one layer above it (TechTile, so they
 * keep their name tooltip on hover, focus and tap); a mouse click on a logo opens the project
 * too, so the card still behaves as one target.
 */
export function ProjectCard({ project, index = 0, layout = "standalone" }: ProjectCardProps) {
  const meta = projectTypeMeta(project.projectType);
  const cover = project.coverImage;
  const href = `/projects/${project.slug}`;
  // Drawn in the browser after hydration; the server sends only its base colour.
  const contour = <Contour seed={project.slug} dark className="pc-contour" />;
  const skills = project.technologies.slice(0, MAX_SKILLS);

  return (
    <article className="pc" data-rows={bentoRows(layout, index)}>
      <div className="pc-frame">
        <span aria-hidden="true" className="pc-base">
          {!cover && contour}
        </span>
        {cover && (
          <StrapiImage
            src={cover.url}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 560px"
            style={{ objectFit: "cover" }}
            className="pc-cover"
            fallback={contour}
          />
        )}
        <span aria-hidden="true" className="pc-scrim" />

        <div className="pc-body">
          <div className="pc-fold pc-meta">
            <div>
              <div className="pc-meta-row">
                <span className="pc-type">{meta.label}</span>
                <span className="pc-year mono">{project.year}</span>
              </div>
            </div>
          </div>

          <h3 className="pc-title">
            <Link href={href} className="pc-link">
              {project.title}
            </Link>
          </h3>

          <div className="pc-fold pc-sum">
            <div>
              <p>{project.summary}</p>
            </div>
          </div>

          <div className="pc-fold pc-tech">
            <div>
              <div className="pc-tech-row">
                <div className="pc-skills">
                  {skills.length > 0
                    ? skills.map((t) => (
                        // Name only, as 2a's title tooltip shows (no level on cards).
                        <TechTile key={t.id} item={{ name: t.name, logo: t.logo }} variant="card" href={href} />
                      ))
                    : // Legacy plain-text stack, for projects with no linked technologies yet.
                      project.techStack.slice(0, MAX_SKILLS).map((name) => (
                        <span key={name} className="pc-chip mono">
                          {name}
                        </span>
                      ))}
                </div>
                {layout !== "services" && (
                  <span aria-hidden="true" className="pc-details mono">
                    Details →
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
