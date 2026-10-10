"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrolled } from "@/hooks/use-scrolled";
import { Logo } from "./logo";
import { MENU_RESET_WIDTH, NAV_STAGES, isActiveLink, navLinks } from "./nav-links";
import { NavIcon } from "./nav-icon";
import { ThemeToggle } from "./theme-toggle";
import { MkdirPill } from "./mkdir-pill";
import { MobileMenuButton, MobileMenuPanel } from "./mobile-menu";

/** 2a sticks the nav as soon as the page leaves the top. */
const STUCK_AT = 8;

/**
 * The five 2a stages (see NAV_STAGES) as media queries. Mobile first: the base rules in
 * globals.css are stage 4 (burger), each query moves one stage up. The per-item tooltip is
 * switched through `--nv-tip`, so it only ever shows on items whose label is hidden.
 */
const { s0, s1, s2, s3 } = NAV_STAGES;
const STAGE_CSS = `
@media (min-width:${s3}px){
.nv-links{display:flex}.nv-burger,.nv-menu{display:none}.nv-mk{display:inline-flex}
.nv-item{padding:0;--nv-tip:block}.nv-item .nv-txt{display:none}
.nv-item[data-active]{padding:0 15px 0 12px;--nv-tip:none}.nv-item[data-active] .nv-txt{display:inline}
.nv-mk{padding:0;--nv-tip:block}.nv-mk .nv-txt{display:none}
.nv-mk[data-active]{padding:0 15px;--nv-tip:none}.nv-mk[data-active] .nv-txt{display:inline}
}
@media (min-width:${s2}px){
.nv-item,.nv-item[data-active]{padding:0 16px;--nv-tip:none}.nv-item .nv-ico{display:none}.nv-item .nv-txt{display:inline}
.nv-mk,.nv-mk[data-active]{padding:0;--nv-tip:block}.nv-mk .nv-txt,.nv-mk[data-active] .nv-txt{display:none}
}
@media (min-width:${s1}px){
.nv-mk,.nv-mk[data-active]{padding:0 15px;--nv-tip:none}.nv-mk .nv-txt,.nv-mk[data-active] .nv-txt{display:inline}
}
@media (min-width:${s0}px){
.nv-item,.nv-item[data-active]{padding:0 15px 0 12px}.nv-item .nv-ico{display:block}
}`;

export function Nav() {
  const stuck = useScrolled(STUCK_AT);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 2a drops the open menu once the viewport is wide enough that it can never be shown.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= MENU_RESET_WIDTH) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="nv-wrap nm-root" data-stuck={stuck}>
      <style dangerouslySetInnerHTML={{ __html: STAGE_CSS }} />
      <nav className="nv-bar">
        <Logo />

        <div className="nv-links">
          {navLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                data-active={active || undefined}
                className="nv-item"
              >
                <NavIcon d={link.icon} size={17} className="nv-ico" />
                <span className="nv-txt">{link.label}</span>
                <span role="tooltip" className="nv-tip">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="nv-right">
          <MkdirPill active={isActiveLink(pathname, "/mkdir")} />
          <MobileMenuButton ref={triggerRef} open={menuOpen} onOpenChange={setMenuOpen} />
          <ThemeToggle />
        </div>
      </nav>

      <MobileMenuPanel open={menuOpen} onOpenChange={setMenuOpen} returnFocusRef={triggerRef} pathname={pathname} />
    </div>
  );
}
