"use client";

import { useState } from "react";
import type { Experience, ExperienceCategory } from "@/content/home";
import { ExperienceTimelineItem } from "@/components/cards/experience-timeline-item";

interface ExperiencesProps {
  experiences: Record<ExperienceCategory, Experience[]>;
}

const TABS: { key: ExperienceCategory; label: string }[] = [
  { key: "education", label: "Education" },
  { key: "organization", label: "Organization" },
  { key: "others", label: "Others" },
];

const TOP_N = 3;

export function Experiences({ experiences }: ExperiencesProps) {
  const [tab, setTab] = useState<ExperienceCategory>("education");
  const [showAll, setShowAll] = useState(false);

  const items = experiences[tab];
  const visible = showAll ? items : items.slice(0, TOP_N);

  const selectTab = (key: ExperienceCategory) => {
    setTab(key);
    setShowAll(false);
  };

  return (
    <section className="relative z-[3] flex justify-center px-[22px] pt-[38px] pb-2.5">
      <div className="w-full max-w-[820px]">
        <div className="mb-6 text-center">
          <h2 className="font-bold" style={{ fontSize: "clamp(26px,3vw,38px)", letterSpacing: "-0.03em" }}>
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
                onClick={() => selectTab(t.key)}
                className="tab-btn"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: "var(--ink-faint)" }}>
            No entries yet.
          </p>
        ) : (
          <>
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
              {visible.map((experience, index) => (
                <ExperienceTimelineItem key={experience.id} experience={experience} index={index} />
              ))}
            </div>

            {items.length > TOP_N && (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold"
                >
                  {showAll ? "Show less" : `Show all (${items.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
