"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { Certification } from "@/content/certifications";
import { CertificateViewer } from "@/components/certifications/certificate-viewer";
import { shouldIgnoreCardClick } from "@/components/ui/card-toggle";
import { PlainText } from "@/components/ui/plain-text";
import { deriveInitials } from "@/lib/mappers";

/**
 * /certifications renders cards expanded while the list is short enough to read at a glance,
 * and collapsed once it gets long. Change this one number to move the threshold.
 */
export const EXPANDED_BY_DEFAULT_MAX = 6;

interface CertificationCardProps {
  certification: Certification;
  /** The Experiences tab always passes false; /certifications derives it from the count. */
  defaultExpanded?: boolean;
  /** `h2` on the list page, `h3` inside the Experiences section's own `h2`. The level also
   *  picks 2a's size: the tab card is a step smaller than the page card. */
  headingLevel?: "h2" | "h3";
}

/**
 * The single certification card, used by both /certifications and the Experiences tab so the
 * two surfaces cannot drift apart. Portfolio 2a's card: logo well, title, issuer · date, kind
 * pill, chevron; expanding adds the description, skill chips and the credential / certificate
 * controls.
 *
 * Those controls live in the expanded body, outside the header `<button>` — nesting a link
 * inside a button is invalid HTML and breaks assistive tech.
 */
export function CertificationCard({
  certification: c,
  defaultExpanded = false,
  headingLevel: Heading = "h2",
}: CertificationCardProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const bodyId = useId();

  return (
    <article
      className="cc"
      data-size={Heading === "h3" ? "tab" : "page"}
      // Convenience only: the header button below is the real control. Clicks from anything
      // interactive (or a text selection drag) are left alone.
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
        className="cc-head"
      >
        {/* Fixed-size well, so a missing or broken logo can't change the row height. */}
        <span aria-hidden="true" className="cc-logo mono">
          {c.issuerLogo ? (
            <Image
              src={c.issuerLogo.url}
              alt=""
              width={34}
              height={34}
              style={{ width: 34, height: 34, objectFit: "contain" }}
            />
          ) : (
            deriveInitials(c.issuer)
          )}
        </span>

        <span className="cc-text">
          <Heading className="cc-title">{c.title}</Heading>
          <span className="cc-sub">
            {c.issuer} · {c.issueDate}
          </span>
        </span>

        <span className="cc-kind">{c.kindLabel}</span>

        <span aria-hidden="true" className="nm-chev" data-open={open || undefined}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div id={bodyId} className="cc-body">
          {c.description && <PlainText text={c.description} className="cc-desc" />}

          {c.skills.length > 0 && (
            <ul className="cc-skills">
              {c.skills.map((s) => (
                <li key={s} className="cc-skill mono">
                  {s}
                </li>
              ))}
            </ul>
          )}

          {/* All four credentialId/credentialUrl combinations: a link labelled with the id when
              both exist, a generic link when only the url does, plain text when only the id
              does, and nothing at all when neither is set. */}
          {(c.credentialUrl || c.credentialId || c.certificateUrl) && (
            <div className="cc-actions">
              {c.credentialUrl ? (
                <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="cc-btn mono">
                  {c.credentialId ? `Credential ${c.credentialId}` : "View credential"}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ) : (
                c.credentialId && <span className="cc-cred-text mono">Credential {c.credentialId}</span>
              )}

              {c.certificateUrl && <CertificateViewer url={c.certificateUrl} title={c.title} />}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
