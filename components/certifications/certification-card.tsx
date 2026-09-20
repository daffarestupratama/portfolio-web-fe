"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { Certification } from "@/content/certifications";
import { CertificateViewer } from "@/components/certifications/certificate-viewer";
import { ChevronDownIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { shouldIgnoreCardClick } from "@/components/ui/card-toggle";
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
  /** `h2` on the list page, `h3` inside the Experiences section's own `h2`. */
  headingLevel?: "h2" | "h3";
}

/**
 * The single certification card, used by both /certifications and the Experiences tab so the
 * two surfaces cannot drift apart.
 *
 * Collapsed shows logo, title, subtitle and the kind pill; expanding adds the description,
 * skill pills and the credential/certificate controls. Those controls live in the expanded
 * body, outside the header `<button>` — nesting a link inside a button is invalid HTML and
 * breaks assistive tech.
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
      className="glass-card cursor-pointer p-4 sm:p-5"
      style={{ borderRadius: 18 }}
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
        className="relative z-[2] flex w-full cursor-pointer items-center gap-4 text-left sm:gap-5"
      >
        {/* Fixed-size tile, so a missing or broken logo can't change the row height. */}
        <span
          aria-hidden="true"
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden p-1.5"
          style={{ borderRadius: 14, background: "var(--glass-bg-2)", border: "1px solid var(--glass-brd)" }}
        >
          {c.issuerLogo ? (
            <Image
              src={c.issuerLogo.url}
              alt=""
              width={34}
              height={34}
              style={{ width: 34, height: 34, objectFit: "contain" }}
            />
          ) : (
            <span className="mono text-[13px] font-bold" style={{ color: "var(--accent-ink)" }}>
              {deriveInitials(c.issuer)}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <Heading className="text-[16.5px] font-semibold" style={{ lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            {c.title}
          </Heading>
          {/* Matches the experience card's subtitle treatment: not monospace, accent ink. */}
          <span className="mt-[3px] block text-[13.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>
            {c.issuer} · {c.issueDate}
          </span>
        </span>

        <span
          className="badge shrink-0"
          style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
        >
          {c.kindLabel}
        </span>

        <ChevronDownIcon
          aria-hidden="true"
          className="shrink-0"
          style={{
            color: "var(--ink-faint)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div id={bodyId} className="relative z-[2] pl-[62px] sm:pl-[66px]">
          {c.description && (
            <p className="mt-2.5 text-[13px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
              {c.description}
            </p>
          )}

          {c.skills.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-[6px]">
              {c.skills.map((s) => (
                <li key={s} className="chip mono px-2.5 py-1 text-[11px]" style={{ borderRadius: 8 }}>
                  {s}
                </li>
              ))}
            </ul>
          )}

          {/* All four credentialId/credentialUrl combinations: a link labelled with the id when
              both exist, a generic link when only the url does, plain text when only the id
              does, and nothing at all when neither is set. */}
          {(c.credentialUrl || c.credentialId || c.certificateUrl) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {c.credentialUrl ? (
                <a
                  href={c.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-pill mono gap-1.5 px-3 py-1.5 text-[12px] font-medium"
                >
                  {c.credentialId ? `Credential ${c.credentialId}` : "View credential"}
                  <ExternalLinkIcon width={12} height={12} />
                </a>
              ) : (
                c.credentialId && (
                  <span className="mono text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
                    Credential {c.credentialId}
                  </span>
                )
              )}

              {c.certificateUrl && <CertificateViewer url={c.certificateUrl} title={c.title} />}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
