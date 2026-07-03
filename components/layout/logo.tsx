import Link from "next/link";

// Single source of truth for the logo's rendered height, in px — shared by the
// SVG wordmark and the cursor beside it so the cursor always spans the glyphs'
// full cap-height-to-baseline extent (the paths fill their entire viewBox with
// no internal padding, so this value *is* that extent) instead of two
// independently-guessed magic numbers that could drift apart.
const LOGO_HEIGHT = 18;

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="dir home"
      className="inline-flex shrink-0 items-center gap-1.5 no-underline transition-transform duration-200 ease-out hover:-translate-y-px"
    >
      <svg
        height={LOGO_HEIGHT}
        viewBox="0 0 1066 393"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-auto"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M434 36H504V393H289L250 352V152L289 109H434V36ZM434 329V174H327L320 181V323L326 329H434Z"
          style={{ fill: "var(--ink)" }}
        />
        <path d="M639 75H718V0H639V75Z" style={{ fill: "var(--ink)" }} />
        <path d="M586 109H717V330H794V393H566V330H646V174H585V109H586Z" style={{ fill: "var(--ink)" }} />
        <path d="M845 393V109H904L915 118V150L957 109H1066V174H959L915 212V393H845Z" style={{ fill: "var(--ink)" }} />
        <path d="M0 393L173 13H250L78 393H0Z" style={{ fill: "var(--accent)" }} />
      </svg>
      <span
        aria-hidden="true"
        className="w-2 rounded-xs"
        style={{ height: LOGO_HEIGHT, background: "var(--accent)", animation: "blink 1.15s steps(1) infinite" }}
      />
    </Link>
  );
}
