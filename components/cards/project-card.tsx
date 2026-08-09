"use client";

import Link from "next/link";
import type { Project } from "@/content/home";
import { StrapiImage } from "@/components/ui/strapi-image";
import { TechTileRow } from "@/components/ui/tech-tile";
import { ArrowRightIcon } from "@/components/ui/icons";
import { bentoSpan, isTallSpan } from "@/components/cards/bento";
import { projectTypeMeta } from "@/components/cards/project-type-meta";

interface ProjectCardProps {
  project: Project;
  /** Position in the grid — drives the bento tile shape. */
  index?: number;
}

/** Cover-filled bento tile: the cover image fills the card and the metadata sits on top
 *  of a bottom-up scrim. The scrim is a fixed dark gradient (not token-driven) so overlay
 *  text is white-on-dark and legible in BOTH themes over any image — the same
 *  "always-X" approach as the tech tiles' fixed light surface. */
export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const meta = projectTypeMeta(project.projectType);
  const cover = project.coverImage;
  const aspect = cover ? cover.width / cover.height : null;
  const span = bentoSpan(index, aspect);

  return (
    <article
      // `data-tall` marks two-row tiles, which have room to reveal a longer summary.
      data-tall={isTallSpan(span) || undefined}
      className={`pcard group relative isolate overflow-hidden ${span}`}
      style={{
        borderRadius: 20,
        border: "1px solid var(--glass-brd)",
        boxShadow: "var(--glass-sh)",
      }}
    >
      {/* Cover, or a type-hue gradient panel when the project has no cover yet. Both get
          the identical scrim + overlay, so a cover-less card reads as deliberately
          colour-coded by project type rather than broken. */}
      {cover ? (
        <StrapiImage
          src={cover.url}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px"
          style={{ objectFit: "cover" }}
          className="pcard-cover"
          fallback={<span className="pcard-fallback" style={{ ["--pcard-hue" as string]: meta.hue }} />}
        />
      ) : (
        <span className="pcard-fallback" style={{ ["--pcard-hue" as string]: meta.hue }} aria-hidden="true" />
      )}

      <span className="pcard-scrim" aria-hidden="true" />

      <div className="pcard-body relative z-[2] flex h-full flex-col justify-end p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2.5">
          <span
            className="badge"
            style={{
              background: `color-mix(in srgb, ${meta.hue} 30%, rgba(8,18,22,0.62))`,
              borderColor: `color-mix(in srgb, ${meta.hue} 50%, transparent)`,
              color: "#fff",
            }}
          >
            {meta.label}
          </span>
          <span className="mono shrink-0 text-[11px]" style={{ color: "rgba(255,255,255,0.72)" }}>
            {project.year}
          </span>
        </div>

        <h3 className="pcard-heading mt-2.5 text-[18px] font-bold" style={{ letterSpacing: "-0.025em", color: "#fff" }}>
          <Link href={`/projects/${project.slug}`} className="pcard-title transition-opacity hover:opacity-85">
            {project.title}
          </Link>
        </h3>

        {/* Hidden until hover on hover-capable pointers; permanently visible (2 lines) on
            touch — see .pcard-summary in globals.css. */}
        <p className="pcard-summary text-[13px]" style={{ lineHeight: 1.5, color: "rgba(255,255,255,0.86)" }}>
          {project.summary}
        </p>

        {/* Compact (2×1) tiles hide the tech tiles at rest and reveal them with the
            summary on hover/tap — see .pcard-tech in globals.css. Feature (2×2) tiles
            have the height to show them always. */}
        <div className="pcard-foot mt-3 flex items-end justify-between gap-3">
          <div className="pcard-tech min-w-0">
            {project.technologies.length > 0 ? (
              <TechTileRow items={project.technologies} size={28} max={5} />
            ) : (
              <div className="flex flex-wrap gap-[6px]">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="mono px-[7px] py-[3px] text-[10.5px]"
                  style={{
                    borderRadius: 7,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/projects/${project.slug}`}
            aria-label={`Details: ${project.title}`}
            className="mono inline-flex shrink-0 items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Details
            <ArrowRightIcon width={13} height={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
