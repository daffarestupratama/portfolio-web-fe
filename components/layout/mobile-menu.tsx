"use client";

import { forwardRef, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { navLinks } from "./nav-links";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const PANEL_ID = "mobile-nav-panel";

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
      className="glass-icon-btn flex h-10 w-10 shrink-0"
    >
      {open ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
});

interface MobileMenuPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export function MobileMenuPanel({ open, onOpenChange, returnFocusRef }: MobileMenuPanelProps) {
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
    <div id={PANEL_ID} className="relative mx-auto w-full max-w-[1080px] px-5 pb-4 md:hidden">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-10 cursor-default border-none bg-transparent p-0"
      />
      <div className="glass-card relative z-20 flex flex-col gap-1 p-3" style={{ borderRadius: 20 }}>
        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            ref={i === 0 ? firstLinkRef : undefined}
            onClick={() => onOpenChange(false)}
            className="nav-link justify-start px-4 py-3 text-base"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
