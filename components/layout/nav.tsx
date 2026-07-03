"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrolled } from "@/hooks/use-scrolled";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenuButton, MobileMenuPanel } from "./mobile-menu";

export function Nav() {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50"
      style={{
        padding: scrolled ? "14px 20px 0" : "0",
        transition: "padding 0.4s cubic-bezier(0.2,0.7,0.2,1)",
      }}
    >
      <div className="flex justify-center">
        <nav className="nav-shell" data-scrolled={scrolled}>
          <Logo />

          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" data-active={pathname === link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileMenuButton ref={triggerRef} open={menuOpen} onOpenChange={setMenuOpen} />
          </div>
        </nav>
      </div>

      <MobileMenuPanel open={menuOpen} onOpenChange={setMenuOpen} returnFocusRef={triggerRef} />
    </div>
  );
}
