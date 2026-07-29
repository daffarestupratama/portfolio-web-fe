import { FEATURES } from "@/lib/features";

export interface NavLink {
  href: string;
  label: string;
}

// mkdir lives in its own terminal-styled pill on the right (see mkdir-pill.tsx),
// so it's intentionally not in this center-links / mobile-menu list.
// Tours is gated behind FEATURES.tours (hidden while the site is portfolio-only).
export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  ...(FEATURES.tours ? [{ href: "/tours", label: "Tours" }] : []),
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/guestbook", label: "Guestbook" },
];
