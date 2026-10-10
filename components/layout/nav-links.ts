import { FEATURES } from "@/lib/features";

export interface NavLink {
  href: string;
  label: string;
  /** Single-path 24×24 stroke icon (2a's `ICONS` table). */
  icon: string;
}

/** 2a's nav icon paths, keyed by page. */
export const NAV_ICONS = {
  home: "M3 10.5L12 3l9 7.5M5.5 9v11h4.5v-6h4v6h4.5V9",
  projects: "M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  articles: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
  services: "M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8.5 8V5.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V8M3 13h18",
  guestbook: "M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.6-5.2A8.4 8.4 0 1 1 21 11.5z",
  about: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mkdir: "M4 17l6-6-6-6M12 19h8",
  /** 2a's fallback for a page without its own icon (a plain circle). Tours uses it. */
  fallback: "M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0",
} as const;

// mkdir lives in its own terminal-styled pill on the right (see mkdir-pill.tsx), so it's
// intentionally not in this list; the mobile menu appends it.
// Tours is gated behind FEATURES.tours (hidden while the site is portfolio-only).
export const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: NAV_ICONS.home },
  { href: "/projects", label: "Projects", icon: NAV_ICONS.projects },
  { href: "/articles", label: "Articles", icon: NAV_ICONS.articles },
  ...(FEATURES.tours ? [{ href: "/tours", label: "Tours", icon: NAV_ICONS.fallback }] : []),
  { href: "/services", label: "Services", icon: NAV_ICONS.services },
  { href: "/guestbook", label: "Guestbook", icon: NAV_ICONS.guestbook },
  { href: "/about", label: "About", icon: NAV_ICONS.about },
];

export const mkdirLink: NavLink = { href: "/mkdir", label: "mkdir", icon: NAV_ICONS.mkdir };

/** Active for the page itself and anything below it, so /projects stays lit on a project. */
export function isActiveLink(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 2a's five nav stages, as min-width breakpoints. 2a derives them in JS from the viewport
 * width and the link count n (`330 + n·117 + 98`, …); the same formula runs here once at
 * module scope, so the server renders the right stage with no hydration flash, and a
 * Tours link (n = 7) shifts every threshold exactly as it would in 2a.
 *
 *  stage 0  ≥ s0  icon + text
 *  stage 1  ≥ s1  text only
 *  stage 2  ≥ s2  text only, mkdir icon-only
 *  stage 3  ≥ s3  icon only, text on the active item
 *  stage 4  <  s3 burger menu; mkdir moves into the menu
 *
 * For the current six links: 1130 / 980 / 922 / 734.
 */
const NAV_BASE = 330;
const n = navLinks.length;
export const NAV_STAGES = {
  s0: NAV_BASE + n * 117 + 98,
  s1: NAV_BASE + n * 92 + 98,
  s2: NAV_BASE + n * 92 + 40,
  s3: NAV_BASE + n * 44 + 140,
} as const;

/** 2a closes the menu once the viewport reaches this width, independent of the link count. */
export const MENU_RESET_WIDTH = 980;
