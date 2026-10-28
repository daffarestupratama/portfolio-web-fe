"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Experience, ExperienceCategory } from "@/content/home";
import type { Certification } from "@/content/certifications";
import { ExperienceTimelineItem } from "@/components/cards/experience-timeline-item";
import { CertificationCard } from "@/components/certifications/certification-card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { NavIcon } from "@/components/layout/nav-icon";

/** Certifications aren't Experience entries in Strapi; they borrow this section's space
 *  rather than adding another one to the page. */
const CERTIFICATIONS_TAB = "certifications";
type TabKey = ExperienceCategory | typeof CERTIFICATIONS_TAB;

interface ExperiencesProps {
  experiences: Record<ExperienceCategory, Experience[]>;
  /** Featured only, uncapped, already ordered by the same comparator /certifications uses. */
  certifications?: Certification[];
}

/** Single-path 24×24 tab glyphs, drawn for NavIcon (the navbar's stroke, caps and size). */
const XP_TAB_ICONS = {
  work: "M4 7.5h16a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 4 7.5zM8.5 7.5v-2A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5v2",
  education: "M2.5 9.5L12 5l9.5 4.5L12 14zM6.5 11.6V16c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.4M21.5 9.5v5",
  leadership: "M15.5 20v-1.5a3.5 3.5 0 0 0-3.5-3.5H6a3.5 3.5 0 0 0-3.5 3.5V20M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21.5 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.6a3.5 3.5 0 0 1 0 6.8",
  certifications: "M12 15a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM8.6 13.8L7.5 21l4.5-2.5 4.5 2.5-1.1-7.2",
  others: "M12 3L2.5 8 12 13l9.5-5zM2.5 12.5L12 17.5l9.5-5M2.5 17L12 22l9.5-5",
} as const;

/**
 * Order is declared here and nowhere else. `label` is what the tab shows (and its tooltip);
 * `name` is the accessible name, which always contains the label.
 */
const TABS: { key: TabKey; label: string; name: string; icon: string }[] = [
  { key: "work", label: "Work", name: "Work", icon: XP_TAB_ICONS.work },
  { key: "education", label: "Education", name: "Education", icon: XP_TAB_ICONS.education },
  { key: "organization", label: "Leadership", name: "Leadership/Organization", icon: XP_TAB_ICONS.leadership },
  { key: CERTIFICATIONS_TAB, label: "Certifications", name: "Certifications", icon: XP_TAB_ICONS.certifications },
  { key: "others", label: "Others", name: "Others", icon: XP_TAB_ICONS.others },
];

const TOP_N = 3;

/**
 * The tab row's three stages, like the navbar's (nav-links.ts NAV_STAGES): icon + label when it
 * fits, label only while the labels still fit without the icon, and icon only below that (the
 * label then shows as a tooltip). The breakpoints depend on how many tabs are offered, which the
 * server already knows, so they are solved here once for every count and emitted as media
 * queries keyed on `data-n`: the first render is the right stage, with no hydration flash.
 *
 * Widths are measured in the tab font (Inter 600, 14px): the widest label, "Certifications", is
 * 89.2px. Every stage keeps equal `1fr` columns and only changes the track's width, so the thumb
 * (one column wide) lines up with the active tab in all of them.
 */
const LABEL_MAX = 90;
/** Icon + label tab: icon 17, gap 7, and 2a's 16px side padding. */
const TAB_W = LABEL_MAX + 17 + 7 + 2 * 16;
/** Label-only tab at its narrowest: 6px each side (today's 360px row keeps about 7.5px). */
const LABEL_MIN = LABEL_MAX + 2 * 6;
/** 2a's label tabs from 640px, and the compact icon-only tabs there. */
const TAB_W_LABEL = 136;
const TAB_W_ICON = 64;
/** Desktop browsers count a classic scrollbar in the media-query width but not in layout. */
const SCROLLBAR = 17;

/** Width the tab track can use at viewport width `vw`: the 820px column inside the section's
 *  clamp(16px, 4vw, 40px) side padding, less the wrap's 2px each side. */
function trackRoom(vw: number): number {
  const content = vw - (vw >= 640 ? SCROLLBAR : 0);
  return Math.min(820, content - 2 * Math.min(40, Math.max(16, 0.04 * vw))) - 4;
}

function smallestWidth(fits: (vw: number) => boolean): number {
  let vw = 240;
  while (!fits(vw)) vw++;
  return vw;
}

/** The stage breakpoints for `n` tabs: label only from `label`, icon + label from `iconLabel`. */
function xpTabStages(n: number): { label: number; iconLabel: number } {
  return {
    label: smallestWidth((vw) => (trackRoom(vw) - 12) / n >= LABEL_MIN),
    iconLabel: smallestWidth((vw) => trackRoom(vw) >= n * TAB_W + 12),
  };
}

const XP_STAGE_CSS = [1, 2, 3, 4, 5]
  .map((n) => {
    const { label, iconLabel } = xpTabStages(n);
    const t = `.xp-tabs[data-n="${n}"]`;
    return (
      `@media (min-width:${label}px){${t} .xp-txt{display:inline}${t} .xp-ico{display:none}${t} .xp-tab{--xp-tip:none}}` +
      `@media (min-width:${Math.max(label, 640)}px){${t}{width:min(100%,${n * TAB_W_LABEL + 12}px)}}` +
      `@media (min-width:${iconLabel}px){${t}{width:${n * TAB_W + 12}px}${t} .xp-ico{display:block}}`
    );
  })
  .join("\n");

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
    <section className="xp">
      <div className="xp-inner">
        <h2 className="xp-title">Experiences</h2>

        <div className="xp-tabs-wrap">
          <style dangerouslySetInnerHTML={{ __html: XP_STAGE_CSS }} />
          <div
            role="tablist"
            aria-label="Experience category"
            className="xp-tabs"
            data-n={tabs.length}
            style={{ "--xp-tabs": tabs.length, "--xp-i": index } as CSSProperties}
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
                aria-label={t.name}
                aria-selected={tab === t.key}
                aria-controls="xp-panel"
                tabIndex={tab === t.key ? 0 : -1}
                data-active={tab === t.key || undefined}
                onClick={() => selectTab(t.key)}
                className="xp-tab"
              >
                <NavIcon d={t.icon} size={17} className="xp-ico" />
                <span className="xp-txt">{t.label}</span>
                <span role="tooltip" className="xp-tip">
                  {t.label}
                </span>
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
