"use client";

import { forwardRef, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { isActiveLink, mkdirLink, navLinks } from "./nav-links";
import { NavIcon } from "./nav-icon";

const PANEL_ID = "mobile-nav-panel";

/** 2a's menu lists every nav link plus mkdir, which has no pill of its own at this stage. */
const menuLinks = [...navLinks, mkdirLink];

interface MobileMenuButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileMenuButton = forwardRef<HTMLButtonElement, MobileMenuButtonProps>(function MobileMenuButton(
  { open, onOpenChange },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpenChange(!open)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls={PANEL_ID}
      className="nv-burger"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    </button>
  );
});

interface MobileMenuPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  pathname: string;
}

export function MobileMenuPanel({ open, onOpenChange, returnFocusRef, pathname }: MobileMenuPanelProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        returnFocusRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange, returnFocusRef]);

  if (!open) return null;

  return (
    <>
      {/* Invisible click-away layer: tapping outside the panel closes it. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className="nv-menu fixed inset-0 z-[-1] cursor-default border-none bg-transparent p-0"
      />
      <div id={PANEL_ID} className="nv-menu nv-menu-panel">
        {menuLinks.map((link, i) => {
          const active = isActiveLink(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              onClick={() => onOpenChange(false)}
              aria-current={active ? "page" : undefined}
              data-active={active || undefined}
              className="nv-menu-item"
            >
              <NavIcon d={link.icon} size={18} style={{ flexShrink: 0, color: "var(--accent-ink)" }} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
