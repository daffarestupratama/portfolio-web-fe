"use client";

import { useEffect, type RefObject } from "react";

interface UseLightboxOptions {
  /** Whether the dialog is currently mounted/open. */
  open: boolean;
  /** Called on Escape. The caller is responsible for returning focus to its trigger. */
  onClose: () => void;
  /** The dialog element — focused on open and used as the focus-trap boundary. */
  dialogRef: RefObject<HTMLElement | null>;
  /** Extra key handling (e.g. arrow navigation). Runs before the built-in handling. */
  onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * Shared modal behaviour for lightbox-style dialogs: focus the dialog on open, lock body
 * scroll, close on Escape, and trap Tab within the dialog.
 *
 * Extracted from Gallery so the certificate viewer gets the identical, already-proven
 * behaviour instead of a second implementation. Callers still own their own markup and must
 * portal to `document.body` — `.glass-card` sets `backdrop-filter`, which makes it a
 * containing block even for `position: fixed` descendants, so an in-card dialog is clipped
 * at the card edge.
 */
export function useLightbox({ open, onClose, dialogRef, onKeyDown }: UseLightboxOptions) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.focus());

    const handleKeyDown = (e: KeyboardEvent) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap. Anchors count too — the certificate viewer's fallback is a link, and
      // leaving it out would let Tab escape the dialog.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, dialogRef, onKeyDown]);
}
