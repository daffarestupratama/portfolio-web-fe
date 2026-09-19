import Image from "next/image";
import type { Certification } from "@/content/certifications";
import { CertificateViewer } from "@/components/certifications/certificate-viewer";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { deriveInitials } from "@/lib/mappers";

/** One certification row. Server-rendered — only the certificate viewer is a client island. */
export function CertificationCard({ certification: c }: { certification: Certification }) {
  return (
    <article className="glass-card flex gap-4 p-4 sm:gap-5 sm:p-5" style={{ borderRadius: 18 }}>
      {/* Issuer logo on the same fixed-size glass tile the experience timeline uses, so a
          missing or broken logo can't change the row's height. */}
      <span
        aria-hidden="true"
        className="relative z-[2] flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden p-1.5"
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

      <div className="relative z-[2] flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="badge"
            style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
          >
            {c.kindLabel}
          </span>
          {/* Discreet, and the row still renders in place — an expired credential is history,
              not an error. */}
          {c.isExpired && (
            <span className="chip mono px-2 py-1 text-[10.5px]" style={{ borderRadius: 7, color: "var(--ink-faint)" }}>
              Expired
            </span>
          )}
        </div>

        <h2 className="mt-2 text-[16.5px] font-semibold" style={{ lineHeight: 1.3, letterSpacing: "-0.02em" }}>
          {c.title}
        </h2>

        <p className="mono mt-1 text-[12px]" style={{ color: "var(--ink-faint)" }}>
          {c.issuer} · {c.issueDate}
        </p>

        {c.description && (
          <p className="mt-2 text-[13px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
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
      </div>
    </article>
  );
}
