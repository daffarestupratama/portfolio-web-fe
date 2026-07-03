export interface NavLink {
  href: string;
  label: string;
}

// Brief §6: Home, Projects, Articles, mkdir, Tours, About (the export's own
// nav is missing mkdir since the export only covers the homepage).
export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/mkdir", label: "mkdir" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
];
