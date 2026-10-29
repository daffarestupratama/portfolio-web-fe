"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/content/home";
import { ProjectCard } from "@/components/cards/project-card";
import { byProjectTypeOrder, projectTypeMeta } from "@/components/cards/project-type-meta";

interface ProjectsFilterProps {
  projects: Project[];
}

const ALL = "__all__";
const BATCH = 6;

export function ProjectsFilter({ projects }: ProjectsFilterProps) {
  const types = useMemo(
    () => Array.from(new Set(projects.map((p) => p.projectType))).sort(byProjectTypeOrder),
    [projects],
  );
  const [active, setActive] = useState<string>(ALL);
  const [count, setCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const showFilter = types.length > 1;
  const filtered = active === ALL ? projects : projects.filter((p) => p.projectType === active);
  const shown = filtered.slice(0, count);
  const hasMore = count < filtered.length;

  // Switching filter also resets the reveal window (done here, not in an effect).
  const selectType = (type: string) => {
    setActive(type);
    setCount(BATCH);
  };

  // Reveal the next batch when the sentinel scrolls into view.
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => c + BATCH);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, shown.length]);

  return (
    <>
      {/* 2a's type chips sit under the page header. Shown only when there is more than one
          type to choose between (a lone "All" chip would filter nothing). */}
      {showFilter && (
        <div className="pg-chips-wrap">
          <div className="pg-chips" role="group" aria-label="Filter projects by type">
            {[ALL, ...types].map((type) => {
              const isActive = active === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectType(type)}
                  aria-pressed={isActive}
                  className="pg-chip"
                >
                  {type === ALL ? "All" : projectTypeMeta(type).label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <section className="pg-body">
        <div className="bento" data-layout="projects">
          {shown.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} layout="projects" />
          ))}
        </div>
        {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-8" />}
      </section>
    </>
  );
}
