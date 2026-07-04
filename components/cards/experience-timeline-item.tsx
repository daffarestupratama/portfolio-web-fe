"use client";

import { useId, useState } from "react";
import { useTilt } from "@/hooks/use-tilt";
import type { Experience } from "@/content/home";
import { ChevronDownIcon } from "@/components/ui/icons";

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
  const [open, setOpen] = useState(false);
  const bodyId = useId();
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
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="relative z-[2] flex w-full items-start gap-[14px] text-left"
        >
          <span
            aria-hidden="true"
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center text-sm font-bold text-white"
            style={{
              borderRadius: 14,
              background: logoBg,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 16px -8px color-mix(in srgb, var(--accent) 60%, transparent)",
            }}
          >
            {experience.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1">
              <span className="text-base font-semibold" style={{ letterSpacing: "-0.02em" }}>
                {experience.organization}
              </span>
              <span className="mono shrink-0 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                {experience.dateRange}
              </span>
            </span>
            <span className="mt-[3px] block text-[13.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>
              {experience.role}
            </span>
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="mt-2.5 shrink-0"
            style={{
              color: "var(--ink-faint)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {open && (
          <div id={bodyId} className="relative z-[2] pl-[60px]">
            <p className="mt-2.5 text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
              {experience.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
