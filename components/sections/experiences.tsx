"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Experience, ExperienceCategory } from "@/content/home";
import type { Certification } from "@/content/certifications";
import { ExperienceTimelineItem } from "@/components/cards/experience-timeline-item";
import { CertificationCard } from "@/components/certifications/certification-card";
import { ArrowRightIcon } from "@/components/ui/icons";

/** Certifications aren't Experience entries in Strapi; they borrow this section's space
 *  rather than adding another one to the page. */
const CERTIFICATIONS_TAB = "certifications";
type TabKey = ExperienceCategory | typeof CERTIFICATIONS_TAB;

interface ExperiencesProps {
  experiences: Record<ExperienceCategory, Experience[]>;
  /** Featured only, uncapped, already ordered by the same comparator /certifications uses. */
  certifications?: Certification[];
}

/** Order is declared here and nowhere else — Certifications sits third, before Others. */
const TABS: { key: TabKey; label: string }[] = [
  { key: "education", label: "Education" },
  { key: "organization", label: "Organization" },
  { key: CERTIFICATIONS_TAB, label: "Certifications" },
  { key: "others", label: "Others" },
];

const TOP_N = 3;

/**
 * Portfolio 2a's Experiences: an inset tab track with a raised thumb that springs between
 * tabs, then either the experience timeline or the featured certification cards.
 *
 * A tab with nothing in it is not offered at all (the existing rule for Certifications,
 * now applied to every tab), so the strip never shows a dead tab. 2a instead keeps an empty
 * "Others" tab with "No entries yet."
 */
export function Experiences({ experiences, certifications = [] }: ExperiencesProps) {
  const tabs = TABS.filter((t) =>
    t.key === CERTIFICATIONS_TAB ? certifications.length > 0 : experiences[t.key].length > 0,
  );
  const [selected, setSelected] = useState<TabKey | null>(null);
  const [showAll, setShowAll] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tabs.length === 0) return null;

  // Fall back to the first offered tab (also covers a selection whose tab disappeared).
  const tab = tabs.some((t) => t.key === selected) ? selected! : tabs[0]!.key;
  const index = tabs.findIndex((t) => t.key === tab);
  const showingCertifications = tab === CERTIFICATIONS_TAB;
  const items = showingCertifications ? [] : experiences[tab as ExperienceCategory];
  const visible = showAll ? items : items.slice(0, TOP_N);

  // Below 640px (latest 2a) the track fills the width instead of scrolling: one row, or two
  // columns once there are more than three tabs. The thumb moves by column and row there.
  const narrowCols = tabs.length > 3 ? 2 : tabs.length;
  const narrowRows = Math.ceil(tabs.length / narrowCols);

  const selectTab = (key: TabKey) => {
    setSelected(key);
    setShowAll(false);
  };

  // WAI-ARIA tabs pattern: arrows move between tabs (with wrap), Home/End jump to the ends.
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    selectTab(tabs[next]!.key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="xp nm-root">
      <div className="xp-inner">
        <h2 className="xp-title">Experiences</h2>

        <div className="xp-tabs-wrap">
          <div
            role="tablist"
            aria-label="Experience category"
            className="xp-tabs"
            data-rows={narrowRows > 1 || undefined}
            style={
              {
                "--xp-tabs": tabs.length,
                "--xp-i": index,
                "--xp-cols": narrowCols,
                "--xp-rows": narrowRows,
                "--xp-col": index % narrowCols,
                "--xp-row": Math.floor(index / narrowCols),
              } as CSSProperties
            }
            onKeyDown={onTabKey}
          >
            <span aria-hidden="true" className="xp-thumb" />
            {tabs.map((t, i) => (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`xp-tab-${t.key}`}
                aria-selected={tab === t.key}
                aria-controls="xp-panel"
                tabIndex={tab === t.key ? 0 : -1}
                data-active={tab === t.key || undefined}
                onClick={() => selectTab(t.key)}
                className="xp-tab"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div id="xp-panel" role="tabpanel" aria-labelledby={`xp-tab-${tab}`}>
          {showingCertifications ? (
            /* Same CertificationCard the /certifications page uses, so the two surfaces cannot
               drift. Always collapsed here: the tab is a summary, and the full detail is one
               click away on the page. */
            <div className="xp-certs">
              {certifications.map((c) => (
                <CertificationCard key={c.id} certification={c} defaultExpanded={false} headingLevel="h3" />
              ))}
              <div className="xp-center">
                <Link href="/certifications" className="xp-pill">
                  View all certifications
                  <ArrowRightIcon width={15} height={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="xp-timeline">
              <div aria-hidden="true" className="xp-rail" />
              {visible.map((experience) => (
                <ExperienceTimelineItem key={experience.id} experience={experience} />
              ))}
              {items.length > TOP_N && (
                <div className="xp-more-wrap">
                  <button type="button" onClick={() => setShowAll((v) => !v)} className="xp-more">
                    {showAll ? "Show less" : `Show all (${items.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
