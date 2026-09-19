"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Experience, ExperienceCategory } from "@/content/home";
import type { Certification } from "@/content/certifications";
import { ExperienceTimelineItem } from "@/components/cards/experience-timeline-item";
import { ArrowRightIcon } from "@/components/ui/icons";
import { deriveInitials } from "@/lib/mappers";

/** Certifications aren't Experience entries in Strapi; they borrow this section's space
 *  rather than adding another one to the page. */
const CERTIFICATIONS_TAB = "certifications";
type TabKey = ExperienceCategory | typeof CERTIFICATIONS_TAB;

interface ExperiencesProps {
  experiences: Record<ExperienceCategory, Experience[]>;
  /** Top few, already ordered by the same comparator /certifications uses. */
  certifications?: Certification[];
}

const TABS: { key: ExperienceCategory; label: string }[] = [
  { key: "education", label: "Education" },
  { key: "organization", label: "Organization" },
  { key: "others", label: "Others" },
];

const TOP_N = 3;

export function Experiences({ experiences, certifications = [] }: ExperiencesProps) {
  const [tab, setTab] = useState<TabKey>("education");
  const [showAll, setShowAll] = useState(false);

  // Only offered when there is something to show, so the tab strip never gains a dead tab.
  const hasCertifications = certifications.length > 0;
  const showingCertifications = tab === CERTIFICATIONS_TAB;

  const items = showingCertifications ? [] : experiences[tab as ExperienceCategory];
  const visible = showAll ? items : items.slice(0, TOP_N);

  const selectTab = (key: TabKey) => {
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
            {hasCertifications && (
              <button
                type="button"
                role="tab"
                aria-selected={showingCertifications}
                data-active={showingCertifications}
                onClick={() => selectTab(CERTIFICATIONS_TAB)}
                className="tab-btn"
              >
                Certifications
              </button>
            )}
          </div>
        </div>

        {showingCertifications ? (
          /* Compact, non-expanding rows. The experience items expand to reveal a description
             AND a gallery; a certification has no gallery and often no description, so the
             same disclosure would open onto nothing. A link to the full page beats expanding
             dozens of rows inside a tab. */
          <>
            <ul className="flex flex-col gap-3">
              {certifications.map((c) => (
                <li key={c.id} className="glass-card flex items-center gap-4 px-5 py-4" style={{ borderRadius: 18 }}>
                  <span
                    aria-hidden="true"
                    className="relative z-[2] flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden p-1.5"
                    style={{ borderRadius: 13, background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
                  >
                    {c.issuerLogo ? (
                      <Image
                        src={c.issuerLogo.url}
                        alt=""
                        width={30}
                        height={30}
                        style={{ width: 30, height: 30, objectFit: "contain" }}
                      />
                    ) : (
                      <span className="mono text-[12px] font-bold" style={{ color: "var(--accent-ink)" }}>
                        {deriveInitials(c.issuer)}
                      </span>
                    )}
                  </span>

                  <div className="relative z-[2] min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold" style={{ letterSpacing: "-0.02em" }}>
                      {c.title}
                    </p>
                    <p className="mono mt-0.5 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
                      {c.issuer} · {c.issueDate}
                    </p>
                  </div>

                  <span
                    className="badge relative z-[2] hidden shrink-0 sm:inline-flex"
                    style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
                  >
                    {c.kindLabel}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-center">
              <Link
                href="/certifications"
                className="glass-pill gap-[7px] px-[17px] py-[9px] text-[13.5px] font-semibold"
              >
                View all certifications
                <ArrowRightIcon />
              </Link>
            </div>
          </>
        ) : items.length === 0 ? (
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
