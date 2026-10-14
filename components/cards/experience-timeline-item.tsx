"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { Experience } from "@/content/home";
import { shouldIgnoreCardClick } from "@/components/ui/card-toggle";
import { Gallery } from "@/components/ui/gallery";
import { PlainText } from "@/components/ui/plain-text";

interface ExperienceTimelineItemProps {
  experience: Experience;
}

/** One entry on 2a's Experiences timeline: a raised card beside an inset rail, expanding to
 *  the location, the description and a gallery grid. */
export function ExperienceTimelineItem({ experience }: ExperienceTimelineItemProps) {
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const bodyId = useId();

  return (
    <div className="xp-item">
      <span aria-hidden="true" className="xp-dot">
        <span />
      </span>

      <div
        className="xp-card"
        // Convenience only: the header button below is the real control. Clicks from anything
        // interactive — notably the Gallery thumbnails in the expanded body — are left alone,
        // as are clicks that end a text selection.
        onClick={(e) => {
          if (shouldIgnoreCardClick(e.target)) return;
          setOpen((v) => !v);
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="xp-head"
        >
          <span aria-hidden="true" className="xp-logo">
            {experience.logo && !logoError ? (
              <Image
                src={experience.logo.url}
                alt=""
                width={36}
                height={36}
                onError={() => setLogoError(true)}
                style={{ width: 36, height: 36, objectFit: "contain" }}
              />
            ) : (
              experience.initials
            )}
          </span>
          <span className="xp-text">
            <span className="xp-line">
              <span className="xp-org">{experience.organization}</span>
              <span className="xp-date mono">{experience.dateRange}</span>
            </span>
            <span className="xp-role">{experience.role}</span>
          </span>
          <span aria-hidden="true" className="nm-chev" data-open={open || undefined}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {open && (
          <div id={bodyId} className="xp-body">
            {experience.location && <div className="xp-loc mono">{experience.location}</div>}
            <PlainText text={experience.description} className="xp-desc" />
            <Gallery images={experience.gallery} variant="grid" />
          </div>
        )}
      </div>
    </div>
  );
}
