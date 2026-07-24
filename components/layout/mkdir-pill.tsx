import Link from "next/link";
import { TerminalIcon } from "@/components/ui/icons";

/** Terminal-flavored command pill for the mkdir micro-blog, pinned to the right
 *  of the nav next to the theme toggle. The `>mkdir` label collapses to just the
 *  glyph under `sm` so it stays compact on narrow screens. */
export function MkdirPill() {
  return (
    <Link
      href="/mkdir"
      aria-label="mkdir"
      // The /mkdir page is still deferred (404s); disable prefetch so the nav pill
      // doesn't fire a failing background request on every page. Re-enable when it ships.
      prefetch={false}
      className="glass-pill mono h-10 shrink-0 gap-1.5 px-2.5 text-[13px] font-medium sm:px-3.5"
      style={{ color: "var(--ink)" }}
    >
      <TerminalIcon style={{ color: "var(--accent-ink)" }} />
      <span className="hidden sm:inline">
        <span style={{ color: "var(--accent-ink)" }}></span>mkdir
      </span>
    </Link>
  );
}
