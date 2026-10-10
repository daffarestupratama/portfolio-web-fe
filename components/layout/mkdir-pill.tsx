import Link from "next/link";

/** Terminal-flavoured pill for the mkdir micro-blog, right of the nav links. Its label and
 *  tooltip follow the nav stages in nav.tsx: label at stages 0–1, icon-only at 2, icon-only
 *  unless active at 3, and hidden at 4, where the mobile menu lists it instead. */
export function MkdirPill({ active }: { active: boolean }) {
  return (
    <Link
      href="/mkdir"
      aria-label="mkdir"
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className="nv-mk"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--accent-ink)" }}
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
      <span className="nv-txt">mkdir</span>
      <span role="tooltip" className="nv-tip">
        mkdir
      </span>
    </Link>
  );
}
