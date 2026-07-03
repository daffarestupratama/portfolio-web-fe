import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="dir home"
      className="inline-flex shrink-0 items-center gap-1.5 no-underline transition-transform duration-200 ease-out hover:-translate-y-px"
    >
      <svg height="18" viewBox="0 0 1066 393" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-auto">
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
        className="h-[18px] w-2 rounded-sm"
        style={{ background: "var(--accent)", animation: "blink 1.15s steps(1) infinite" }}
      />
    </Link>
  );
}
