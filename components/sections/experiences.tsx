"use client";

import { useState } from "react";
import type { Experience, ExperienceCategory } from "@/content/home";
import { ExperienceTimelineItem } from "@/components/cards/experience-timeline-item";

interface ExperiencesProps {
  experiences: Record<ExperienceCategory, Experience[]>;
}

const TABS: { key: ExperienceCategory; label: string }[] = [
  { key: "professional", label: "Professional" },
  { key: "education", label: "Education" },
  { key: "org", label: "Org" },
];

export function Experiences({ experiences }: ExperiencesProps) {
  const [tab, setTab] = useState<ExperienceCategory>("professional");
  const items = experiences[tab];

  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[38px] pb-2.5">
      <div className="w-full max-w-[820px]">
        <div className="mb-6 text-center">
          <div className="mono text-xs tracking-[0.14em] uppercase" style={{ color: "var(--accent-ink)" }}>
            01 — Journey
          </div>
          <h2 className="mt-2 font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
            Experiences
          </h2>
        </div>

        <div className="mb-[30px] flex justify-center">
          <div
            role="tablist"
            aria-label="Experience category"
            className="inline-flex gap-1 p-[5px]"
            style={{
              borderRadius: 999,
              background: "var(--glass-bg)",
              backgroundImage: "var(--glass-tint)",
              backdropFilter: "blur(var(--glass-blur)) saturate(180%)",
              border: "1px solid var(--glass-brd)",
              boxShadow: "inset 0 1px 0 var(--glass-hi), var(--glass-sh)",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                data-active={tab === t.key}
                onClick={() => setTab(t.key)}
                className="tab-btn"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative pl-1">
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[19px] w-0.5"
            style={{
              borderRadius: 2,
              background: "linear-gradient(var(--sky), var(--teal), var(--green))",
              opacity: 0.5,
            }}
          />
          {items.map((experience, index) => (
            <ExperienceTimelineItem key={experience.id} experience={experience} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
