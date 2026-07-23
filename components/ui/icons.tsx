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

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" {...base} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function TerminalIcon(props: IconProps) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="1.9" {...base} {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="2.4" {...base} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Filled WhatsApp glyph (not stroke-based, so it doesn't spread `base`). */
export function WhatsappIcon(props: IconProps) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.31-1.95 1.35-.5.05-1.13.24-3.66-.77-3.09-1.22-5.05-4.37-5.2-4.57-.15-.2-1.24-1.65-1.24-3.15s.79-2.24 1.07-2.54c.28-.3.61-.38.81-.38.2 0 .41 0 .58.01.19.01.44-.07.69.53.24.6.83 2.07.9 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.07 1.3 2.37 1.45.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.35.07.13.07.73-.17 1.41z" />
    </svg>
  );
}
