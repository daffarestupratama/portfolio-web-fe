import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Shown when the active theme is dark (click to switch to light). */
export function SunIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
    </svg>
  );
}

/** Shown when the active theme is light (click to switch to dark). */
export function MoonIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.7" {...base} {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.6" y1="6.4" x2="17.61" y2="6.4" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polyline points="3 6 12 13 21 6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.7" {...base} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
