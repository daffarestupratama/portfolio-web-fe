"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/content/home";
import { ProjectCard } from "@/components/cards/project-card";
import { badgeStyle, projectTypeMeta } from "@/components/cards/project-type-meta";

interface ProjectsFilterProps {
  projects: Project[];
}

const ALL = "__all__";
const BATCH = 6;

export function ProjectsFilter({ projects }: ProjectsFilterProps) {
  const types = useMemo(() => Array.from(new Set(projects.map((p) => p.projectType))), [projects]);
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
      {showFilter && (
        <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Filter projects by type">
          <button
            type="button"
            onClick={() => selectType(ALL)}
            data-active={active === ALL}
            className="tab-btn"
            style={{ fontSize: "12.5px", padding: "7px 15px" }}
          >
            All
          </button>
          {types.map((type) => {
            const meta = projectTypeMeta(type);
            const isActive = active === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => selectType(type)}
                aria-pressed={isActive}
                className="badge cursor-pointer"
                style={{
                  ...badgeStyle(meta.hue),
                  padding: "7px 15px",
                  fontSize: "12.5px",
                  outline: isActive ? "2px solid var(--accent)" : "none",
                  outlineOffset: 2,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
        {shown.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-8" />}
    </>
  );
}
