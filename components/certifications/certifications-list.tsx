"use client";

import { useMemo, useState } from "react";
import type { Certification } from "@/content/certifications";
import { CertificationCard, EXPANDED_BY_DEFAULT_MAX } from "@/components/certifications/certification-card";

const ALL = "__all__";

/**
 * The list plus a `kind` filter that only renders once more than one kind exists — the same
 * self-hiding rule ArticlesBrowser uses for its language filter. Today every entry is a
 * `course`, so the filter stays out of the way; it appears on its own as the data grows.
 * No pagination: the set is capped at a few dozen by design.
 */
export function CertificationsList({ certifications }: { certifications: Certification[] }) {
  const [kind, setKind] = useState<string>(ALL);

  const kinds = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of certifications) if (!seen.has(c.kind)) seen.set(c.kind, c.kindLabel);
    return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [certifications]);

  const showFilter = kinds.length > 1;
  const visible = kind === ALL ? certifications : certifications.filter((c) => c.kind === kind);
  // Short lists read better fully open; long ones are easier to scan collapsed. Derived from
  // the unfiltered total so filtering doesn't change how existing cards are presented.
  const defaultExpanded = certifications.length <= EXPANDED_BY_DEFAULT_MAX;

  return (
    <>
      {showFilter && (
        <div className="ct-chips" role="group" aria-label="Filter by type">
          <button type="button" onClick={() => setKind(ALL)} aria-pressed={kind === ALL} className="nm-chip">
            All
          </button>
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
              className="nm-chip"
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="pg-empty">No certifications match this filter.</p>
      ) : (
        visible.map((c) => (
          <CertificationCard key={c.id} certification={c} defaultExpanded={defaultExpanded} headingLevel="h2" />
        ))
      )}
    </>
  );
}
