"use client";

import { useTilt } from "@/hooks/use-tilt";
import type { Experience } from "@/content/home";

const LOGO_GRADIENTS = [
  "linear-gradient(145deg, var(--sky), var(--teal))",
  "linear-gradient(145deg, var(--teal), var(--green))",
  "linear-gradient(145deg, var(--green), var(--sky))",
  "linear-gradient(145deg, var(--sky), var(--green))",
];

interface ExperienceTimelineItemProps {
  experience: Experience;
  index: number;
}

export function ExperienceTimelineItem({ experience, index }: ExperienceTimelineItemProps) {
  const ref = useTilt<HTMLDivElement>();
  const logoBg = LOGO_GRADIENTS[index % LOGO_GRADIENTS.length];

  return (
    <div className="relative pb-[18px] pl-[54px]">
      <span
        aria-hidden="true"
        className="absolute top-[22px] left-3 z-[2] h-4 w-4 rounded-full"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--accent)",
          boxShadow:
            "0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent), 0 0 12px color-mix(in srgb, var(--accent) 45%, transparent)",
        }}
      >
        <span className="absolute inset-[3px] rounded-full" style={{ background: "var(--accent)" }} />
      </span>

      <div ref={ref} data-tilt className="glass-card px-5 py-[18px]" style={{ borderRadius: 20 }}>
        <div className="relative z-[2] flex items-start gap-[14px]">
          <div
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center text-sm font-bold text-white"
            style={{
              borderRadius: 14,
              background: logoBg,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 16px -8px color-mix(in srgb, var(--accent) 60%, transparent)",
            }}
          >
            {experience.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1">
              <h3 className="m-0 text-base font-semibold" style={{ letterSpacing: "-0.02em" }}>
                {experience.organization}
              </h3>
              <span className="mono shrink-0 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                {experience.dateRange}
              </span>
            </div>
            <div className="mt-[3px] text-[13.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>
              {experience.role}
            </div>
            <p className="mt-2.5 text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
              {experience.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
